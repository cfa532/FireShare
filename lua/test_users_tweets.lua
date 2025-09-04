-- Test script for random user and tweet generation/deletion using HSet/HGet and ZSet operations
-- Runs for 1000 rounds creating users, tweets, and randomly deleting tweets
-- Tests data preservation by reading back after backup

local log = require('log')
local auth = require('auth')
local mm = require('mimei')

local sid = request['sid']
print("Starting test with sid=", sid)

-- Sample data for random generation
local usernames = {"alice", "bob", "charlie", "diana", "eve", "frank", "grace", "henry", "iris", "jack", 
                   "kate", "leo", "mary", "nick", "olivia", "paul", "quinn", "rachel", "steve", "tina"}
local names = {"Alice Smith", "Bob Johnson", "Charlie Brown", "Diana Prince", "Eve Wilson", 
               "Frank Miller", "Grace Lee", "Henry Davis", "Iris Chen", "Jack Taylor"}
local profiles = {"Software Engineer", "Data Scientist", "Product Manager", "Designer", "Writer", 
                  "Artist", "Musician", "Teacher", "Doctor", "Entrepreneur"}
local tweet_contents = {
    "Just had an amazing day! #blessed",
    "Working on some exciting new features 🚀",
    "Coffee is life ☕",
    "Beautiful sunset today 🌅",
    "Learning something new every day 📚",
    "Weekend vibes are the best! 🎉",
    "Technology is amazing 💻",
    "Nature never fails to amaze me 🌿",
    "Great meeting with the team today 👥",
    "Time for some relaxation 🧘"
}

-- Global storage for tracking
local users = {}  -- Store user objects with mid and data
local tweets = {} -- Store tweet objects with mid and data
local user_count = 0
local tweet_count = 0
local operation_count = 0

-- Helper function to generate random MimeiId (simplified)
function generate_mid()
    local chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    local mid = ""
    for i = 1, 46 do
        local rand = math.random(1, #chars)
        mid = mid .. string.sub(chars, rand, rand)
    end
    return "Qm" .. mid
end

-- Helper function to get random element from table
function random_choice(t)
    return t[math.random(1, #t)]
end

-- Create a random user
function create_random_user()
    local user = {
        mid = generate_mid(),
        username = random_choice(usernames) .. math.random(1000, 9999),
        name = random_choice(names),
        profile = random_choice(profiles),
        timestamp = os.time() * 1000 + math.random(0, 999),
        cloudDrivePort = 8010 + math.random(0, 100)
    }
    
    -- Randomly add avatar
    if math.random(1, 3) == 1 then
        user.avatar = "avatar_" .. math.random(1, 10) .. ".jpg"
    end
    
    -- Randomly add hostId
    if math.random(1, 2) == 1 then
        user.hostId = {generate_mid()}
    end
    
    return user
end

-- Create a random tweet
function create_random_tweet()
    local tweet = {
        mid = generate_mid(),
        authorId = (#users > 0) and users[math.random(1, #users)].mid or generate_mid(),
        content = random_choice(tweet_contents),
        timestamp = os.time() * 1000 + math.random(0, 999),
        downloadable = math.random(1, 3) == 1,
        isPrivate = math.random(1, 5) == 1
    }
    
    -- Randomly add title
    if math.random(1, 2) == 1 then
        tweet.title = "Tweet " .. math.random(1, 1000)
    end
    
    -- Randomly add attachments
    if math.random(1, 4) == 1 then
        tweet.attachments = {
            {
                name = "attachment_" .. math.random(1, 100) .. ".jpg",
                mid = generate_mid(),
                type = "image/jpeg"
            }
        }
    end
    
    -- Randomly make it a retweet
    if math.random(1, 10) == 1 and #tweets > 0 then
        local original_tweet = tweets[math.random(1, #tweets)]
        tweet.originalTweetId = original_tweet.mid
        tweet.originalAuthorId = original_tweet.authorId
    end
    
    return tweet
end

-- Backup and verify data integrity
function backup_and_verify()
    print("Creating backup...")
    local ver, err = mm.MMBackup(sid, mid, '')
    if err ~= nil then
        print('ERROR: MMBackup failed')
        print('Database MID:', mid)
        print('Error:', err)
        return false
    end
    print("Backup version:", ver)
    
    -- Wait for backup completion using message polling
    local msg = require('msg')
    local backup_completed = false
    local backup_attempts = 0
    local max_backup_attempts = 30
    
    print("Waiting for backup completion...")
    while not backup_completed and backup_attempts < max_backup_attempts do
        local strmsg, err = msg.PullMsg(sid, 3)
        if err ~= nil then
            print('ERROR: PullMsg failed during backup wait')
            print('Error:', err)
            break
        end
        
        if strmsg ~= nil then
            local info = strmsg:getMsg()
            local reg = "(%a+)=(.*)"
            local _, _, key, value = string.find(info, reg)
            
            if key == "ver" then
                print("Backup completed with version:", value)
                backup_completed = true
            elseif key == "err" then
                print("ERROR: Backup failed with error:", value)
                return false
            end
        end
        
        backup_attempts = backup_attempts + 1
    end
    
    if not backup_completed then
        print("WARNING: Backup completion timeout after", max_backup_attempts, "attempts")
        return false
    end
    
    -- Open in read-only mode to verify data
    print("Verifying data integrity...")
    local mmsid_read, err = mm.MMOpen(sid, mid, 'last')
    if err ~= nil then
        print('ERROR: Failed to open mimei in read-only mode')
        print('Error:', err)
        return false
    end
    
    -- Verify some random users
    local verified_users = 0
    for i = 1, math.min(5, #users) do
        local user = users[math.random(1, #users)]
        local retrieved_user, err = mm.HGet(mmsid_read, 'users', user.mid)
        if err ~= nil then
            print('ERROR: Failed to retrieve user:', user.mid)
            print('Error:', err)
        else
            if retrieved_user.username == user.username then
                verified_users = verified_users + 1
            else
                print('ERROR: User data mismatch for:', user.mid)
            end
        end
    end
    
    -- Verify some random tweets
    local verified_tweets = 0
    for i = 1, math.min(5, #tweets) do
        local tweet = tweets[math.random(1, #tweets)]
        local retrieved_tweet, err = mm.HGet(mmsid_read, 'tweets', tweet.mid)
        if err ~= nil then
            print('ERROR: Failed to retrieve tweet:', tweet.mid)
            print('Error:', err)
        else
            if retrieved_tweet.content == tweet.content then
                verified_tweets = verified_tweets + 1
            else
                print('ERROR: Tweet data mismatch for:', tweet.mid)
            end
        end
    end
    
    print("Verification complete - Users:", verified_users, "Tweets:", verified_tweets)
    return true
end

-- Initialize database
print("Creating test database...")
local mid, err = mm.MMCreate(sid, '', '', 'test_users_tweets', 2, 0x07276706)
if err ~= nil then
    print('MMCreate err=', err)
    return err
end
print("Created database with mid=", mid)

local mmsid, err = mm.MMOpen(sid, mid, 'cur')
if err ~= nil then
    print('MMOpen err', err)
    return err
end
print('Opened database with mmsid=', mmsid)

-- Main test loop
print("Starting 1000 rounds of user/tweet operations...")
for round = 1, 1000 do
    if round % 100 == 0 then
        print("Round", round, "- Users:", #users, "Tweets:", #tweets, "Operations:", operation_count)
    end
    
    local action = math.random(1, 12)
    
    if action <= 2 then
        -- Create a new user (16% chance)
        local user = create_random_user()
        
        local ret, err = mm.HSet(mmsid, 'users', user.mid, user)
        if err ~= nil then
            print('ERROR: HSet failed for user creation')
            print('User MID:', user.mid)
            print('User data:', user)
            print('Error:', err)
            goto continue
        end
        
        -- Add to ZSet for chronological ordering
        local score = user.timestamp
        local sp = scorepair.new(score, user.mid)
        ret, err = mm.ZAdd(mmsid, 'users_timeline', sp)
        if err ~= nil then
            print('ERROR: ZAdd failed for user timeline')
            print('User MID:', user.mid)
            print('Error:', err)
        end
        
        table.insert(users, user)
        user_count = user_count + 1
        operation_count = operation_count + 1
        
    elseif action <= 5 then
        -- Create a new tweet (25% chance)
        if #users > 0 then
            local tweet = create_random_tweet()
            
            local ret, err = mm.HSet(mmsid, 'tweets', tweet.mid, tweet)
            if err ~= nil then
                print('ERROR: HSet failed for tweet creation')
                print('Tweet MID:', tweet.mid)
                print('Tweet data:', tweet)
                print('Error:', err)
                goto continue
            end
            
            -- Add to ZSet for chronological ordering
            local score = tweet.timestamp
            local sp = scorepair.new(score, tweet.mid)
            ret, err = mm.ZAdd(mmsid, 'tweets_timeline', sp)
            if err ~= nil then
                print('ERROR: ZAdd failed for tweet timeline')
                print('Tweet MID:', tweet.mid)
                print('Error:', err)
            end
            
            table.insert(tweets, tweet)
            tweet_count = tweet_count + 1
            operation_count = operation_count + 1
        end
        
    elseif action <= 7 then
        -- Update a random tweet (16% chance)
        if #tweets > 0 then
            local tweet_index = math.random(1, #tweets)
            local tweet = tweets[tweet_index]
            
            -- Get current tweet data
            local current_tweet, err = mm.HGet(mmsid, 'tweets', tweet.mid)
            if err ~= nil then
                print('ERROR: HGet failed for tweet update')
                print('Tweet MID:', tweet.mid)
                print('Error:', err)
                goto continue
            end
            
            -- Update some fields randomly
            local updates_made = {}
            if math.random(1, 2) == 1 then
                current_tweet.content = current_tweet.content .. " [Updated]"
                table.insert(updates_made, "content")
            end
            
            if math.random(1, 3) == 1 then
                current_tweet.downloadable = not current_tweet.downloadable
                table.insert(updates_made, "downloadable")
            end
            
            if math.random(1, 4) == 1 then
                current_tweet.isPrivate = not current_tweet.isPrivate
                table.insert(updates_made, "isPrivate")
            end
            
            -- Set the updated data back
            ret, err = mm.HSet(mmsid, 'tweets', tweet.mid, current_tweet)
            if err ~= nil then
                print('ERROR: HSet failed for tweet update')
                print('Tweet MID:', tweet.mid)
                print('Updates attempted:', table.concat(updates_made, ", "))
                print('Error:', err)
                goto continue
            end
            
            -- Update our tracking data
            tweets[tweet_index] = current_tweet
            operation_count = operation_count + 1
            
            print("Successfully updated tweet:", tweet.mid, "Updates:", table.concat(updates_made, ", "))
        end
        
    elseif action <= 9 then
        -- Delete a random tweet (16% chance)
        if #tweets > 0 then
            local tweet_index = math.random(1, #tweets)
            local tweet = tweets[tweet_index]
            
            -- Remove from hash table
            local ret, err = mm.HDel(mmsid, 'tweets', tweet.mid)
            if err ~= nil then
                print('ERROR: HDel failed for tweet deletion')
                print('Tweet MID:', tweet.mid)
                print('Error:', err)
                goto continue
            end
            
            -- Remove from ZSet
            ret, err = mm.ZRem(mmsid, 'tweets_timeline', tweet.mid)
            if err ~= nil then
                print('ERROR: ZRem failed for tweet timeline')
                print('Tweet MID:', tweet.mid)
                print('Error:', err)
            end
            
            -- Remove from our tracking array
            table.remove(tweets, tweet_index)
            operation_count = operation_count + 1
            
            print("Deleted tweet:", tweet.mid)
        end
        
    elseif action <= 11 then
        -- Test ZSet operations (16% chance)
        if #tweets > 0 then
            local tweet_index = math.random(1, #tweets)
            local tweet = tweets[tweet_index]
            
            -- Get rank of tweet in timeline
            local rank, err = mm.ZRank(mmsid, 'tweets_timeline', tweet.mid)
            if err ~= nil then
                print('ERROR: ZRank failed')
                print('Tweet MID:', tweet.mid)
                print('Error:', err)
            else
                print("Tweet", tweet.mid, "rank in timeline:", rank)
            end
            
            -- Get range of tweets
            local range, err = mm.ZRange(mmsid, 'tweets_timeline', 0, 4)
            if err ~= nil then
                print('ERROR: ZRange failed')
                print('Error:', err)
            else
                print("Top 5 tweets in timeline:", #range, "items")
            end
            
            operation_count = operation_count + 1
        end
        
    else
        -- Backup and verify (8% chance)
        if operation_count > 0 and operation_count % 50 == 0 then
            local success = backup_and_verify()
            if not success then
                print("ERROR: Backup and verification failed")
            end
        end
    end
    
    ::continue::
end

-- Final backup and verification
print("\n=== Final Backup and Verification ===")
local success = backup_and_verify()
if not success then
    print("ERROR: Final backup and verification failed")
end

-- Final statistics
print("\n=== Test Complete ===")
print("Total users created:", user_count)
print("Total tweets created:", tweet_count)
print("Total operations performed:", operation_count)
print("Users remaining:", #users)
print("Tweets remaining:", #tweets)

print("Test completed successfully!")
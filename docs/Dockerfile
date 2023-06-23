FROM python:3.9
WORKDIR /usr/src/app
COPY requires.txt .
RUN pip install --trusted-host https://mirrors.aliyun.com -i https://mirrors.aliyun.com/pypi/simple/ --no-cache-dir -r requires.txt --timeout=100
EXPOSE 5000
CMD ["echo", "DONE"]
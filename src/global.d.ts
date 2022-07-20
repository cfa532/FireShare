type ContentColumn = {
    title: string;
    titleZh?: string;
    orderBy?: number;
    link?: string;
    subColumn?: ContentColumn[];
}

interface ScorePair { score: number, member: string }

type ContentColumn = {
    title: string;
    titleZh: string;
    orderBy?: number;
    link?: string;
    subColumn?: ContentColumn[];
}

interface ScorePair { score: number, member: string }

class FVPair {
    name; lastModified; size; type;
    constructor(name:string, lastModified:number, size:number, type:string) {
      this.name = name;
      this.lastModified = lastModified;
      this.size = size;
      this.type = type;
    }
  }
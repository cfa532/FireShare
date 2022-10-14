type ContentColumn = {
    title: string;
    titleZh: string;
    orderBy?: number;
    link?: string;
    subColumn?: ContentColumn[];
}

interface ScorePair { score: number, member: string }

class FVPair {
    name; lastModified; size; type; macid;
    constructor(name:string, lastModified:number, size:number, type:string, macid:string="") {
      this.name = name;
      this.lastModified = lastModified;
      this.size = size;
      this.type = type;
      this.macid = macid;
    }
  }

  interface Window {
    mmInfo: any;       // add to window obj for testing convenience
    getParam: any;
    hprose: any;
  }
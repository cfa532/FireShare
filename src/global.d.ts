type ContentColumn = {
  title: string;
  titleZh: string;
  orderBy?: number;
  link?: string;
  subColumn?: ContentColumn[];
};

interface ScorePair { score: number; member: string };
interface FVPair {field: string; value: any};
interface FileInfo {name:string; lastModified:number; size:number; type:string; macid:string; caption:string};

interface Window {
  mmInfo: any;       // add to window obj for testing convenience
  getParam: any;
  hprose: any;
};
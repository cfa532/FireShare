type ContentColumn = {
  title: string;
  titleZh: string;
  orderBy?: number;
  link?: string;
  subColumn?: ContentColumn[];
};

interface ScorePair { score: number; member: string };
// declare function ScorePair() {}
// window.ScorePair = function() {}

interface FVPair {field: string; value: any};
interface FileInfo {name:string; lastModified:number; size:number; type:string; macid:string;
  caption:string;   // Displayed in File List view
};

interface Window {
  mmInfo: any;       // add to window obj for testing convenience
  getParam: any;
  hprose: any;
};
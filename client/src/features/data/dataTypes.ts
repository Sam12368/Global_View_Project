export interface YearValue {
    year: number;
    value: number | "NA";
}

export interface  TempAnomalyArea {
    lat: number;
    lon: number;
    data: YearValue[];
}

export interface TempAnomalyData {
    tempanomalies: TempAnomalyArea [];
}

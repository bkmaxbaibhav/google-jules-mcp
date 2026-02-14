export interface Tool {
  name: string
  metaData: MetaData | any
  handler: any
}

interface MetaData {
    description: string,
    inputSchema: any
}
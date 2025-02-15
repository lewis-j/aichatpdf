import { getEmbeddings } from "./embeddings";
import { getPineconeClient } from "./pinecone";
import { convertToAscii } from "./utils";
export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  const pinecone = await getPineconeClient();
  const index = pinecone.Index("chatpdf-yt");
  try {
    const nameSpace = convertToAscii(fileKey);
    const indexRecord = index.namespace(nameSpace);
    const queryResult = await indexRecord.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.error("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);
  console.log("matches", matches);
  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );
  console.log("qualifying docs", qualifyingDocs);
  type Metadata = {
    text: string;
    pageNumber: number;
  };

  const docs = qualifyingDocs
    .map((match) => (match.metadata as Metadata).text)
    .join("/n");
  if (docs.length === 0) {
    return matches
      .map((match) => (match.metadata as Metadata).text)
      .join("/n")
      .substring(0, 3000);
  }

  return docs.substring(0, 3000);
}

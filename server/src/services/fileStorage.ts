import {
  BlobServiceClient,
  BlobSASPermissions,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";
import { randomUUID } from "crypto";

const getBlobContainerClient = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  const containerName = process.env.AZURE_STORAGE_CONTAINER;

  if (!connectionString || !containerName) {
    throw new Error(
      "Azure Blob Storage is not configured. Missing AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_CONTAINER.",
    );
  }

  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  return blobServiceClient.getContainerClient(containerName);
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const parseStorageAccountFromConnectionString = () => {
  const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connectionString) {
    throw new Error(
      "Azure Blob Storage is not configured. Missing AZURE_STORAGE_CONNECTION_STRING.",
    );
  }

  const accountNameMatch = connectionString.match(/AccountName=([^;]+)/i);
  const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/i);

  if (!accountNameMatch?.[1] || !accountKeyMatch?.[1]) {
    throw new Error("Invalid Azure Storage connection string");
  }

  return {
    accountName: accountNameMatch[1],
    accountKey: accountKeyMatch[1],
  };
};

export const uploadBufferToAzureBlob = async ({
  buffer,
  mimeType,
  userId,
  originalFileName,
  folder,
  publicAccess,
}: {
  buffer: Buffer;
  mimeType: string;
  userId: string;
  originalFileName: string;
  folder: "images" | "pdfs" | "audios";
  publicAccess?: "blob";
}) => {
  const containerClient = getBlobContainerClient();
  await containerClient.createIfNotExists(
    publicAccess ? { access: publicAccess } : undefined,
  );

  const safeFileName = sanitizeFileName(originalFileName || "upload");
  const blobName = `${folder}/${userId}/${Date.now()}-${randomUUID()}-${safeFileName}`;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  return blockBlobClient.url;
};

export const createBlobReadSasUrl = ({
  blobUrl,
  expiresInMs = 365 * 24 * 60 * 60 * 1000,
}: {
  blobUrl: string;
  expiresInMs?: number;
}) => {
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  if (!containerName) {
    throw new Error(
      "Azure Blob Storage is not configured. Missing AZURE_STORAGE_CONTAINER.",
    );
  }

  const parsed = new URL(blobUrl);
  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length < 2) {
    throw new Error("Invalid blob URL");
  }

  const blobName = decodeURIComponent(segments.slice(1).join("/"));
  const { accountName, accountKey } = parseStorageAccountFromConnectionString();
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn: new Date(Date.now() + expiresInMs),
    },
    sharedKeyCredential,
  ).toString();

  return `${parsed.origin}/${containerName}/${encodeURIComponent(blobName).replace(/%2F/g, "/")}?${sasToken}`;
};

export const deleteAzureBlobByUrl = async (blobUrl: string) => {
  const containerClient = getBlobContainerClient();

  const parsed = new URL(blobUrl);
  const segments = parsed.pathname.split("/").filter(Boolean);

  // URL format: /<container>/<blobName>
  if (segments.length < 2) {
    return;
  }

  const blobName = decodeURIComponent(segments.slice(1).join("/"));
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

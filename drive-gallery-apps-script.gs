const FOLDER_ID = "IDE_CSAK_A_FOLDER_ID_KELL";
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function doGet() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const images = [];

  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) continue;
    if (file.isTrashed()) continue;

    // The website renders these images directly, so they need public read access.
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const id = file.getId();
    images.push({
      id,
      name: file.getName(),
      createdTime: file.getDateCreated().toISOString(),
      fullUrl: `https://drive.google.com/uc?export=view&id=${id}`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1200`,
      webViewUrl: file.getUrl(),
    });
  }

  images.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));

  return ContentService
    .createTextOutput(JSON.stringify({ images }))
    .setMimeType(ContentService.MimeType.JSON);
}

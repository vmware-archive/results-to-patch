const resultTypes = require('./resultTypes');

module.exports = function(r) {
  if (r.deleted) {
    return {type: resultTypes.FILE_ATTACHMENT, id: r.id, deleted: true};
  } else {
    const attrs = {};
    if (r.hasOwnProperty('filename')) attrs.filename = r.filename;
    if (r.hasOwnProperty('uploader_id')) attrs.uploader = r.uploader_id;
    if (r.hasOwnProperty('created_at')) attrs.createdAt = r.created_at;
    if (r.hasOwnProperty('content_type')) attrs.contentType = r.content_type;
    if (r.hasOwnProperty('size')) attrs.size = r.size;
    if (r.hasOwnProperty('download_url')) attrs.downloadUrl = r.download_url;
    if (r.hasOwnProperty('uploaded')) attrs.uploaded = r.uploaded;
    if (r.hasOwnProperty('thumbnailable')) attrs.thumbnailable = r.thumbnailable;
    if (r.hasOwnProperty('height')) attrs.height = r.height;
    if (r.hasOwnProperty('width')) attrs.width = r.width;
    if (r.hasOwnProperty('thumbnail_url')) attrs.thumbnailUrl = r.thumbnail_url;
    if (r.hasOwnProperty('big_url')) attrs.bigUrl = r.big_url;
    return {type: resultTypes.FILE_ATTACHMENT, id: r.id, attrs: attrs};
  }
};

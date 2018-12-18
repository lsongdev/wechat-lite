const assert = require('assert');

const unpack = data => {
  let offset = 0, nl = 0;
  assert.equal(data instanceof Buffer, true, 'data must be a buffer');
  const be = data.readUInt8(offset);    offset+=1;
  const fl = data.readUInt32BE(offset); offset+=4;
  const ml = data.readUInt32BE(offset); offset+=4;
  const cl = data.readUInt32BE(offset); offset+=4;
  const ed = data.readUInt8(offset);    offset+=1;
  assert.equal(be, 0xbe, 'must begin with 0xbe');
  assert.equal(fl, 0x01, 'must begin with 0x01');
  assert.equal(ed, 0xed, 'must begin with 0xed');
  const file_metas = data.slice(offset, offset += ml);
  const file_datas = data.slice(offset, offset += cl);
  assert.equal(offset, data.length, 'invaild package length');
  const file_count = file_metas.readUInt32BE(0);
  for(let i=0, l, o=4; i < file_count; i++, o += (4*3) + l, nl += l){
    l = file_metas.readUInt32BE(o);
  }
  // base
  const BASE_OFFSET = 18 + 12 * file_count + nl;
  // reset offset
  const files = [];
  for(let i=0, offset = 4;i<file_count;i++){
    const file_name_length = file_metas.readUInt32BE(offset);offset+=4;
    const file_name_buffer = file_metas.slice(offset, offset += file_name_length);
    const content_offset   = file_metas.readUInt32BE(offset);offset+=4;
    const content_length   = file_metas.readUInt32BE(offset);offset+=4;
    const p = content_offset - BASE_OFFSET;
    files.push({
      filename: file_name_buffer.toString(),
      data: file_datas.slice(p, p + content_length)
    });
  }
  return files;
};

module.exports = unpack;

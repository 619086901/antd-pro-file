export async function getFetch(url) {
  let res = await fetch(url);
  let data = await res.json();
  return data;
}

// 下载文件
export async function fetchDownload(key) {
  const req = await fetch(`${API_SERVER_9997}/download`, {
    method: 'POST',
    body: JSON.stringify({
      name: key,
    }),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  return req;
}

/**
 *
 * @param {*} param
 * @returns
 */
export async function fetchEditable(param) {
  const req = await fetch(`${API_SERVER_9997}/editable`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      newName: param.newName, // 新名称
      name: param.name, // 旧名称
      folder: param.folder, //文件类型
    }),
  });
  return req;
}

export async function fetchSelect() {
  const req = await fetch(`${API_SERVER_9997}/select`);
  return req;
}

export async function fetchSelectLs() {
  const req = await fetch(`${API_SERVER_9997}/select_ls`);
  return req;
}

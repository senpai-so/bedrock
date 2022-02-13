async function handleErrors(response: Response) {
  if (!response.ok) {
    const msg = await response.text()
    throw Error(msg)
  }
  return response
}

const get = (
  endpoint: string,
): Promise<Response> => {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1)
  }

  // TODO urlencode params
  return fetch(`/api/${endpoint}`).then(handleErrors)
}

const post = (
  endpoint: string,
  body: Record<string, unknown> | undefined
): Promise<Response> => {
  if (endpoint.startsWith('/')) {
    endpoint = endpoint.slice(1)
  }

  return fetch(`/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(handleErrors)
}

export const api = { get, post }
export default api

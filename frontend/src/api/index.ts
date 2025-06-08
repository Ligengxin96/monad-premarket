import { addToast } from "@heroui/react";

export enum RequestMethod {
  POST = "POST",
  GET = "GET",
}

interface RequestFetchOptions {
  method: RequestMethod;
  headers: HeadersInit;
  body?: Record<string, any>;
}

export const requestFetch = (path: string, options: RequestFetchOptions) => {
  const { method, headers, body } = options;
  const requestOptions = {
    method,
    headers,
    body: JSON.stringify(body),
  };
  const requestUrl = `http://43.198.115.10${path}`;

  return fetch(requestUrl, requestOptions)
    .then((response) => {
      handleResponseStatus(response);
      return response;
    })
    .catch((error) => {
      console.error("Fetch request failed.", error);
      throw error;
    });
};

const handleResponseStatus = (response: Response) => {
  switch (response.status) {
    case 403:
      addToast({
        title: "Authorization Expired",
        description: "Authorization is expired, please request for a new one.",
        color: "warning",
      });
      break;
    default:
      return;
  }
};

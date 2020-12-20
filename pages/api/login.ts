import type { NextApiRequest, NextApiResponse } from "next";

// @todo extract and re-use and customize per env
const old_api = "http://localhost:3001";

export default async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const response = await fetch(`${old_api}/login`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "post",
    body: JSON.stringify(req.body),
  });

  const data = await response.json();

  res.status(200).json(data);
};

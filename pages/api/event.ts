import type { NextApiRequest, NextApiResponse } from "next";
import { pipeline, PipelineSource } from "stream";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await fetch(
    "https://api.apyhub.com/generate/ical/file?output=invite.ics",
    {
      method: "POST",
      headers: {
        [process.env.APY_CRED as string]: process.env.APY_CRED as string,
        "Content-Type": "application/json",
        "apy-token": process.env.APY_TOKEN as string,
      },
      body: JSON.stringify(req.body),
    }
  );
  if (!response.ok) {
    res.status(response.status).json({ error: response.statusText });
    return;
  }
  res.setHeader("Content-Type", "text/calendar");
  res.setHeader("Content-Disposition", "attachment; filename=invite.ics");
  pipeline(response.body as any, res, (err) => {
    if (err) {
      console.error(err);
      res.status(500).end();
    }
  });
};

export default handler;

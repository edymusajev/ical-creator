import type { NextApiRequest, NextApiResponse } from "next";
import { pipeline, PipelineSource } from "stream";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const response = await fetch(
    "https://api.apyhub.com/generate/ical/file?output=invite.ics",
    {
      method: "POST",
      headers: {
        effcc3dd055176c44594cf3f231f23c9: "effcc3dd055176c44594cf3f231f23c9",
        "Content-Type": "application/json",
        "apy-token": "mAfEovIdFzW5v5Y7iSldMSKG7srH1ieiscwCEF5j59ImxT7nIg95mN",
      },
      body: JSON.stringify(req.body),
    }
  );
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

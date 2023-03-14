import { Request, Response } from "express";
import { FreeCreditsLink } from "../Models/freeCreditsLink";
// import { User } from "../Models/User";

let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomString(length: number) {
  let result = "";
  for (let i = 0; i < length; ++i) {
    result += alphabet[Math.floor(alphabet.length * Math.random())];
  }
  return result;
}

export class freeCreditsLinkController {
  static create = async (req: Request, res: Response): Promise<any> => {
    try {
      const input = req.body;
      const dataToSave: any = {
        code: randomString(10),
        freeCredits: input.freeCredits,
        maxUseCounts: input.maxUseCounts,
        useCounts: 0,
      };
      const data = await FreeCreditsLink.create(dataToSave);
      return res.json({ data: data });
    } catch (error) {
      res.status(500).json({ error: { message: "something Went wrong." } });
    }
  };

  static show = async (req: any, res: Response): Promise<any> => {
    let dataToFind: any = {};
    if (req.query.search) {
      dataToFind = {
        ...dataToFind,
        $or: [{ code: { $regex: req.query.search, $options: "i" } }],
      };
    }
    try {
      const query = await FreeCreditsLink.find(dataToFind)
        .populate("user.userId")
        .sort({ createdAt: -1 });
      return res.json({
        data: query,
      });
    } catch (error) {
      res.status(500).json({ error: { message: "something Went wrong." } });
    }
  };
  
  static delete = async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    try {
      const dataToSave: any = {
        isDisabled: true,
      };
      const data = await FreeCreditsLink.findByIdAndUpdate(id, dataToSave, {
        new: true,
      });
      return res.json({ data: data });
    } catch (error) {
      res.status(500).json({ error: { message: "something Went wrong." } });
    }
  };
}

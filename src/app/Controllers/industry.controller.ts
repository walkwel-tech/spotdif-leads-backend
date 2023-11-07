import { Request, Response } from "express";
import { order } from "../../utils/constantFiles/businessIndustry.orderList";
import { BuisnessIndustries } from "../Models/BuisnessIndustries";
import { User } from "../Models/User";
import { RolesEnum } from "../../types/RolesEnum";
import { IndustryInput } from "../Inputs/Industry.input";
import { validate } from "class-validator";
import { ValidationErrorResponse } from "../../types/ValidationErrorResponse";
import { LeadTablePreference } from "../Models/LeadTablePreference";
import { BuisnessIndustriesInterface } from "../../types/BuisnessIndustriesInterface";
// import { columnsObjects } from "../../types/columnsInterface";
import { json } from "../../utils/constantFiles/businessIndustryJson";
const LIMIT = 10;
export class IndustryController {
  static create = async (req: Request, res: Response) => {
    const input = req.body;
    const Industry = new IndustryInput();
    Industry.industry = input.industry;
    Industry.leadCost = input.leadCost;

    const errors = await validate(Industry);

    if (errors.length) {
      const errorsInfo: ValidationErrorResponse[] = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return res
        .status(400)
        .json({ error: { message: "VALIDATIONS_ERROR", info: errorsInfo } });
    }
    let dataToSave: Partial<BuisnessIndustriesInterface> = {
      industry: input.industry,
      leadCost: input.leadCost,
      columns: order,
      json: json,
    };

    try {
      const exist = await BuisnessIndustries.find({
        industry: input.industry,
        isDeleted: false,
      });
      if (exist.length > 0) {
        return res
          .status(400)
          .json({ error: { message: "Business Industry should be unique." } });
      }
      const details = await BuisnessIndustries.create(dataToSave);
      // await CustomColumnNames.create({
      //   industryId: details.id,
      //   columnsNames: array,
      // });
      return res.json({ data: details });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong." } });
    }
  };

  static updateOrg = async (req: Request, res: Response) => {
    const input = req.body;
    try {
      const updatedData = await BuisnessIndustries.findByIdAndUpdate(
        req.params.id,
        {
          ...input,
        },
        { new: true }
      );
      if (updatedData === null) {
        return res
          .status(404)
          .json({ error: { message: "Business Industry not found." } });
      }

      if (input.leadCost) {
        await User.updateMany(
          { businessIndustryId: updatedData?.id },
          { leadCost: input.leadCost }
        );
      }

      return res.json({ data: updatedData });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong." } });
    }
  };

  static update = async (req: Request, res: Response) => {
    const input = req.body;
    try {
      if (input.columns) {
        const users = await User.find({ businessIndustryId: req.params.id });
        const data = users.map(async (user: any) => {
          return new Promise(async (resolve, reject) => {
            try {
              const updatedUser = await LeadTablePreference.findOneAndUpdate(
                { userId: user.id },
                {
                  columns: input.columns,
                },
                { new: true }
              );
              resolve(updatedUser); // Resolve the promise with the result
            } catch (error) {
              reject(error); // Reject the promise if an error occurs
            }
          });
        });
        await Promise.all(data);
      }

      const updatedData = await BuisnessIndustries.findByIdAndUpdate(
        req.params.id,
        {
          ...input,
        },
        { new: true }
      );
      if (updatedData === null) {
        return res
          .status(404)
          .json({ error: { message: "Business Industry not found." } });
      }
      updatedData?.columns.sort((a: any, b: any) => a.index - b.index);

      if (input.leadCost) {
        await User.updateMany(
          { businessIndustryId: updatedData?.id },
          { leadCost: input.leadCost }
        );
      }

      return res.json({ data: updatedData });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong." } });
    }
  };

  static view = async (req: Request, res: Response) => {
    try {
      const sortField: any = req.query.sort || "industry"; // Change this field name as needed

      let sortOrder: any = req.query.order || 1; // Change this as needed

      const perPage =
        //@ts-ignore
        req.query && req.query?.perPage > 0
          ? //@ts-ignore
            parseInt(req.query?.perPage)
          : LIMIT;

      let skip =
        //@ts-ignore
        (req.query && req.query.page > 0 ? parseInt(req.query.page) - 1 : 0) *
        perPage;
      if (sortOrder == "asc") {
        sortOrder = 1;
      } else {
        sortOrder = -1;
      }
      let dataToFind: any = { isDeleted: false };
      if (req.query.search) {
        dataToFind = {
          ...dataToFind,
          $or: [{ industry: { $regex: req.query.search, $options: "i" } }],
        };
      }
      const sortObject: Record<string, 1 | -1> = {};
      sortObject[sortField] = sortOrder;
      let data = await BuisnessIndustries.find(dataToFind)
        .collation({ locale: "en" })
        .sort(sortObject)
        .skip(skip)
        .limit(perPage);
      const dataWithoutPagination = await BuisnessIndustries.find(dataToFind)
        .collation({ locale: "en" })
        .sort({ industry: 1 });
      const totalPages = Math.ceil(dataWithoutPagination.length / perPage);

      if (data && req.query.perPage) {
        let dataToShow = {
          data: data,
          meta: {
            perPage: perPage,
            page: req.query.page || 1,
            pages: totalPages,
            total: dataWithoutPagination.length,
          },
        };
        return res.json(dataToShow);
      } else if (data && !req.query.perPage) {
        let dataToShow = {
          data: dataWithoutPagination,
        };
        return res.json(dataToShow);
      } else {
        return res.status(404).json({ data: { message: "Data not found" } });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong.", error } });
    }
  };

  static viewbyId = async (req: Request, res: Response) => {
    try {
      const data = await BuisnessIndustries.findById(req.params.id);
      if (data?.isDeleted) {
        return res
          .status(404)
          .json({ error: { message: "Business Industry is deleted" } });
      }

      return res.json({ data: data });
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong." } });
    }
  };

  static delete = async (req: Request, res: Response) => {
    try {
      const users = await User.find({
        businessIndustryId: req.params.id,
        isDeleted: false,
        role: RolesEnum.USER,
      });
      if (users.length > 0) {
        return res.status(400).json({
          error: {
            message:
              "Users already registered with this industry. kindly first delete those users.",
          },
        });
      } else {
        await BuisnessIndustries.findByIdAndUpdate(req.params.id, {
          isDeleted: true,
          deletedAt: new Date(),
        });
        const data = await BuisnessIndustries.findById(req.params.id);

        return res.json({ data: data });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong." } });
    }
  };

  static showIndustries = async (req: Request, res: Response) => {
    try {
      const data = await BuisnessIndustries.find(
        { isActive: true },
        { industry: 1 }
      );
      if (data) {
        let array: any = [];
        data.map((data) => {
          array.push(data.industry);
        });
        return res.json({ data: array });
      } else {
        return res.status(404).json({ data: { message: "Data not found" } });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: { message: "Something went wrong.", error } });
    }
  };

  static stats = async (_req: any, res: Response) => {
    try {
      const active = await BuisnessIndustries.find({
        isActive: true,
        isDeleted: false,
      }).count();
      const paused = await BuisnessIndustries.find({
        isActive: false,
        isDeleted: false,
      }).count();

      const dataToShow = {
        activeBusinessIndustries: active,
        pausedBusinessIndustries: paused,
      };
      return res.json({ data: dataToShow });
    } catch (err) {
      return res.status(500).json({
        error: {
          message: "something went wrong",
          err,
        },
      });
    }
  };
}

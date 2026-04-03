import type { Response } from "express";
import { prisma } from "../../config/db.ts";
import type { AuthRequest } from "../../middleware/authenticate.ts";

type RecordType = "INCOME" | "EXPENSE";

export const createRecord = async (req: AuthRequest, res: Response) => {
    try {
      const { amount, type, category, date, note } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const record = await prisma.financialRecord.create({
        data: {
          amount,
          type,
          category,
          date: new Date(date),
          note,
          userId
        },
      });

      res.status(201).json(record);
    } catch (error) {
      return res.status(500).json({ message: "Failed to create record" });
    }
  };


export const getRecordsWithFilters = async(req: AuthRequest, res: Response) => {
    try {
      const { type, category, startDate, endDate } = req.query;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const filters: {
        userId: string;
        type?: RecordType;
        category?: string;
        date?: {
          gte?: Date;
          lte?: Date;
        };
      } = {
        userId,
      };

      if (type) filters.type = type as RecordType;
      if (category) filters.category = category as string;

      if (startDate || endDate) {
        filters.date = {};
        if (startDate) filters.date.gte = new Date(startDate as string);
        if (endDate) filters.date.lte = new Date(endDate as string);
      }

      const records = await prisma.financialRecord.findMany({
        where: filters,
        orderBy: { date: "desc" },
      });

      res.json(records);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch records" });
    }
}

export const updateRecord = async (req: AuthRequest, res: Response) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      const { amount, type, category, date, note } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id) {
        return res.status(400).json({ message: "Record id is required" });
      }

      const record = await prisma.financialRecord.findUnique({
        where: { id },
      });

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      if (record.userId !== userId) {
        return res.status(403).json({ message: "Not allowed" });
      }

      const updated = await prisma.financialRecord.update({
        where: { id },
        data: {
          amount,
          type,
          category,
          date: date ? new Date(date) : undefined,
          note,
        },
      });

      res.json(updated);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update record" });
    }
  };

export const deleteRecord = async (req: AuthRequest, res: Response) => {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!id) {
        return res.status(400).json({ message: "Record id is required" });
      }

      const record = await prisma.financialRecord.findUnique({
        where: { id },
      });

      if (!record) {
        return res.status(404).json({ message: "Record not found" });
      }

      if (record.userId !== userId) {
        return res.status(403).json({ message: "Not allowed" });
      }

      await prisma.financialRecord.delete({
        where: { id },
      });

      res.json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Failed to delete record" });
    }
  };
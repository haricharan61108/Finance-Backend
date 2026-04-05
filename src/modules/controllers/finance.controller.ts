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

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ message: "Amount, type, category, and date are required" });
    }

    if (type !== "INCOME" && type !== "EXPENSE") {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
    }

    const record = await prisma.financialRecord.create({
      data: {
        amount,
        type,
        category,
        date: new Date(date),
        note,
        userId,
      },
    });

    return res.status(201).json(record);
  } catch (error) {
    console.error("Create record error:", error);
    return res.status(500).json({ message: "Failed to create record" });
  }
};


export const getRecordsWithFilters = async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (type && type !== "INCOME" && type !== "EXPENSE") {
      return res.status(400).json({ message: "Invalid type. Must be INCOME or EXPENSE" });
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
      if (startDate) {
        const parsedStartDate = new Date(startDate as string);
        if (isNaN(parsedStartDate.getTime())) {
          return res.status(400).json({ message: "Invalid startDate format" });
        }
        filters.date.gte = parsedStartDate;
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate as string);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ message: "Invalid endDate format" });
        }
        filters.date.lte = parsedEndDate;
      }
    }

    const records = await prisma.financialRecord.findMany({
      where: filters,
      orderBy: { date: "desc" },
    });

    return res.json(records);
  } catch (error) {
    console.error("Fetch records error:", error);
    return res.status(500).json({ message: "Failed to fetch records" });
  }
};

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

    if (type && type !== "INCOME" && type !== "EXPENSE") {
      return res.status(400).json({ message: "Type must be INCOME or EXPENSE" });
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

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (category !== undefined) updateData.category = category;
    if (note !== undefined) updateData.note = note;
    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      updateData.date = parsedDate;
    }

    const updated = await prisma.financialRecord.update({
      where: { id },
      data: updateData,
    });

    return res.json(updated);
  } catch (error) {
    console.error("Update record error:", error);
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

    return res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete record error:", error);
    return res.status(500).json({ message: "Failed to delete record" });
  }
};
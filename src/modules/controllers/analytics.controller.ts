import type { Response } from "express";
import { prisma } from "../../config/db.ts";
import type { AuthRequest } from "../../middleware/authenticate.ts";


export const getSummary = async(req: AuthRequest, res: Response) => {
    try {
       const userId = req.user?.id;

       const whereClause: any = { userId };

       if (req.user?.role === "ADMIN" || req.user?.role === "ANALYST") {
        delete whereClause.userId;
      }

      const income = await prisma.financialRecord.aggregate({
        _sum: { amount : true },
        where: { ...whereClause, type: "INCOME" },
      });

      const expense = await prisma.financialRecord.aggregate({
        _sum: { amount: true },
        where: { ...whereClause, type: "EXPENSE" },
      });

      const totalIncome = income._sum.amount || 0;
      const totalExpense = expense._sum.amount || 0;

      res.json({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      });
    }  
    catch (error) {
        return res.status(500).json({ message: "Failed to fetch summary" });
    }
}


export const getCategoryTotals = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
    const whereClause: any = { userId };
  
    if (req.user?.role === "ADMIN" || req.user?.role === "ANALYST") {
      delete whereClause.userId;
    }
  
    const data = await prisma.financialRecord.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: whereClause,
    });
  
    res.json(data);
   }
   catch (error) {
    return res.status(500).json({ message: "Failed to fetch category totals" });
   }
};


export const getRecentActivity = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    try {
     const whereClause: any = { userId };
  
    if (req.user?.role === "ADMIN" || req.user?.role === "ANALYST") {
      delete whereClause.userId;
    }
  
    const records = await prisma.financialRecord.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  
    res.json(records);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch recent activity" });
    }
 };

export const getMonthlyTrends = async(req: AuthRequest, res: Response) => {
    try {
       const userId = req.user?.id;

       const whereClause: any = { userId };

       if (req.user?.role === "ADMIN" || req.user?.role === "ANALYST") {
        delete whereClause.userId;
      }
      const records = await prisma.financialRecord.findMany({
        where: whereClause,
      });

      const trends: Record<string, {income: number; expense: number}> = {};

      records.forEach((r)=> {
        const month = new Date(r.date).toISOString().slice(0, 7); // YYYY-MM

    if (!trends[month]) {
      trends[month] = { income: 0, expense: 0 };
    }

    if (r.type === "INCOME") {
      trends[month].income += r.amount;
    } else {
      trends[month].expense += r.amount;
    }
      })
      res.json(trends);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch trends" });
    }
}
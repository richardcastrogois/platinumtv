"use strict";
//backend/src/controllers/dashboardController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentMonthStats = exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month, year } = req.query;
        // Validar parâmetros de filtro
        const filterMonth = month ? parseInt(month) : undefined;
        const filterYear = year ? parseInt(year) : undefined;
        if (filterMonth &&
            (isNaN(filterMonth) || filterMonth < 1 || filterMonth > 12)) {
            res.status(400).json({ message: "Mês inválido (deve ser entre 1 e 12)" });
            return;
        }
        if (filterYear &&
            (isNaN(filterYear) || filterYear < 2000 || filterYear > 2100)) {
            res
                .status(400)
                .json({ message: "Ano inválido (deve ser entre 2000 e 2100)" });
            return;
        }
        // Construir a condição de filtro para clientes
        const whereClause = { isActive: true };
        if (filterMonth && filterYear) {
            whereClause.dueDate = {
                gte: new Date(`${filterYear}-${filterMonth.toString().padStart(2, "0")}-01`),
                lt: new Date(filterMonth === 12
                    ? `${filterYear + 1}-01-01`
                    : `${filterYear}-${(filterMonth + 1)
                        .toString()
                        .padStart(2, "0")}-01`),
            };
        }
        // Buscar clientes com o filtro aplicado
        const clients = yield prisma.client.findMany({
            where: whereClause,
            include: {
                paymentMethod: true,
            },
        });
        const gross_amount = clients.reduce((sum, client) => sum + client.grossAmount, 0);
        const net_amount = clients.reduce((sum, client) => sum + client.netAmount, 0);
        const active_clients = clients.filter((client) => client.isActive).length;
        // Calcular o total líquido ajustado (subtraindo R$ 8,00 por ativação)
        const activationCost = active_clients * 8; // R$ 8,00 por ativação
        const totalNetAmount = net_amount - activationCost;
        // Calcular gross_amount por paymentMethod
        const grossByPaymentMethod = clients.reduce((acc, client) => {
            const methodName = client.paymentMethod.name;
            acc[methodName] = (acc[methodName] || 0) + client.grossAmount;
            return acc;
        }, {});
        // Calcular lucro líquido por dia
        const dailyNetProfitRaw = yield prisma.client.groupBy({
            by: ["dueDate"],
            where: whereClause,
            _sum: {
                netAmount: true,
            },
            orderBy: {
                dueDate: "asc",
            },
        });
        const dailyNetProfit = dailyNetProfitRaw.map((entry) => ({
            date: entry.dueDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
            netAmount: entry._sum.netAmount || 0,
        }));
        res.json({
            gross_amount,
            net_amount,
            active_clients,
            totalNetAmount: parseFloat(totalNetAmount.toFixed(2)),
            grossByPaymentMethod,
            dailyNetProfit,
        });
    }
    catch (error) {
        console.error("Error fetching dashboard stats:", error);
        res.status(500).json({ message: "Error fetching dashboard stats" });
    }
});
exports.getDashboardStats = getDashboardStats;
const getCurrentMonthStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1; // 1-12
        const currentYear = currentDate.getFullYear();
        // Buscar clientes ativos no mês atual
        const clients = yield prisma.client.findMany({
            where: {
                isActive: true,
                dueDate: {
                    gte: new Date(`${currentYear}-${currentMonth.toString().padStart(2, "0")}-01`),
                    lt: new Date(currentMonth === 12
                        ? `${currentYear + 1}-01-01`
                        : `${currentYear}-${(currentMonth + 1)
                            .toString()
                            .padStart(2, "0")}-01`),
                },
            },
        });
        // Calcular o total líquido (netAmount) antes do ajuste
        const totalNetAmountBefore = clients.reduce((sum, client) => sum + (client.netAmount || 0), 0);
        // Contar o número de clientes ativos (cada um representa uma ativação)
        const activeClients = clients.length;
        // Subtrair R$ 8,00 por cliente ativo
        const activationCost8 = activeClients * 8; // R$ 8,00 por ativação
        const totalNetAmount8 = totalNetAmountBefore - activationCost8;
        // Subtrair R$ 15,00 por cliente ativo
        const activationCost15 = activeClients * 15; // R$ 15,00 por ativação
        const totalNetAmount15 = totalNetAmountBefore - activationCost15;
        res.json({
            totalNetAmount8: parseFloat(totalNetAmount8.toFixed(2)),
            totalNetAmount15: parseFloat(totalNetAmount15.toFixed(2)),
            activeClients,
        });
    }
    catch (error) {
        console.error("Error fetching current month stats:", error);
        res.status(500).json({ message: "Error fetching current month stats" });
    }
});
exports.getCurrentMonthStats = getCurrentMonthStats;

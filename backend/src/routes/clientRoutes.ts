//backend/src/routes/clientRoutes.ts

import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getPlans,
  getPaymentMethods,
  renewClient,
  reactivateClient,
  updatePaymentStatus,
  editPayment,
  deletePayment,
  updateClientObservations,
} from "../controllers/clientController";
import { authMiddleware } from "../middleware/authMiddleware";

const router: Router = Router();

router.use((req, res, next) => {
  console.log(`Recebida requisição: ${req.method} ${req.originalUrl}`);
  next();
});

router.get("/plans", getPlans);
router.get("/payment-methods", getPaymentMethods);
router.get("/", authMiddleware, getClients);
router.get("/:id", authMiddleware, getClientById);
router.post("/", authMiddleware, createClient);
router.put("/:id", authMiddleware, updateClient);
router.delete("/:id", authMiddleware, deleteClient);
router.put("/renew/:id", authMiddleware, renewClient);
router.put("/reactivate/:id", authMiddleware, reactivateClient);
router.put("/payment-status/:id", authMiddleware, updatePaymentStatus);
router.put("/payments/edit/:id", authMiddleware, editPayment);
router.delete("/payments/delete/:id", authMiddleware, deletePayment);
router.put("/observations/:id", authMiddleware, updateClientObservations);

export default router;
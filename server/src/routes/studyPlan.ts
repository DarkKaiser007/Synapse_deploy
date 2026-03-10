import express from "express";
import { generateStudyPlan } from "../controllers/studyPlan";

const router = express.Router();

router.post("/generate", generateStudyPlan);

export default router;

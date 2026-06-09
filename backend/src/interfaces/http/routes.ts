import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../../application/authUseCases";
import {
  createUserProject,
  listProjectMessages,
  listUserProjects,
  updateUserProject
} from "../../application/projectUseCases";
import { sendProjectMessage } from "../../application/chatUseCases";
import { uploadProjectFile } from "../../application/fileUseCases";
import { currentUser, parseSignedToken, setSessionCookie, clearSessionCookie } from "../../infrastructure/auth/session";
import { requireUser } from "./authMiddleware";
import type { AuthedRequest } from "./types";

const router = Router();

router.post("/register", async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    setSessionCookie(res, result.sessionToken);
    res.status(201).json({ user: result.user, project: result.project });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    setSessionCookie(res, result.sessionToken);
    res.json({ user: result.user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", async (req, res, next) => {
  try {
    await logoutUser(parseSignedToken(req));
    clearSessionCookie(res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    res.json({ user: await currentUser(req) });
  } catch (error) {
    next(error);
  }
});

router.use(requireUser);

router.get("/projects", async (req: AuthedRequest, res, next) => {
  try {
    res.json({ projects: await listUserProjects(req.user!.id) });
  } catch (error) {
    next(error);
  }
});

router.post("/projects", async (req: AuthedRequest, res, next) => {
  try {
    const project = await createUserProject(req.user!.id, req.body);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
});

router.patch("/projects/:projectId", async (req: AuthedRequest, res, next) => {
  try {
    const project = await updateUserProject(req.user!.id, req.params.projectId, req.body);
    res.json({ project });
  } catch (error) {
    next(error);
  }
});

router.get("/projects/:projectId/messages", async (req: AuthedRequest, res, next) => {
  try {
    const messages = await listProjectMessages(req.user!.id, req.params.projectId);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:projectId/chat", async (req: AuthedRequest, res, next) => {
  try {
    const messages = await sendProjectMessage(req.user!.id, req.params.projectId, req.body);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

router.post("/projects/:projectId/files", async (req: AuthedRequest, res, next) => {
  try {
    const file = await uploadProjectFile(req.user!.id, req.params.projectId, req.body);
    res.status(201).json({ file });
  } catch (error) {
    next(error);
  }
});

export default router;

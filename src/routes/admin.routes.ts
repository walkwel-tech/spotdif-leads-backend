import { Router } from "express";

import { AdminSettingsController } from "../app/Controllers/admin.controller";
import { Auth, OnlyAdmins } from "../app/Middlewares";
const adminSettings: Router = Router();

adminSettings.post("/", OnlyAdmins, AdminSettingsController.create);
adminSettings.post(
  "/permissions",
  OnlyAdmins,
  AdminSettingsController.createPermissions
);
adminSettings.patch("/", OnlyAdmins, AdminSettingsController.update);
adminSettings.get("/", OnlyAdmins, AdminSettingsController.show);
adminSettings.get("/notifications", AdminSettingsController.notifications);
adminSettings.get(
  "/clientColumnsPreference",
  Auth,
  AdminSettingsController.showClientTablePreference
);
adminSettings.post(
  "/clientColumnsPreference",
  Auth,
  AdminSettingsController.createPreference
);
adminSettings.get("/FAQs", Auth, AdminSettingsController.showFaqs);
adminSettings.patch("/FAQs", OnlyAdmins, AdminSettingsController.createFaqs);
adminSettings.delete("/", OnlyAdmins, AdminSettingsController.delete);
adminSettings.post("/user-login", AdminSettingsController.userLogin);
adminSettings.post(
  "/update-permissions",
  OnlyAdmins,
  AdminSettingsController.updatePermissions
);
adminSettings.post(
  "/plan-packages",
  Auth,
  AdminSettingsController.createPlanPackages
);

adminSettings.get(
  "/plan-packages",
  Auth,
  AdminSettingsController.getPlanPackages
);

export default adminSettings;

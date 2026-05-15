import dotenv from 'dotenv';

dotenv.config();

export const ENV = {

  // ================= MDM =================
  mdmBaseUrl: process.env.MDM_BASE_URL || '',
  mdmEmail: process.env.MDM_EMAIL || '',
  mdmPassword: process.env.MDM_PASSWORD || '',

  // ================= PLANNING =================
  planningBaseUrl: process.env.PLANNING_BASE_URL || '',
  planningEmail: process.env.PLANNING_EMAIL || '',
  planningPassword: process.env.PLANNING_PASSWORD || '',

};
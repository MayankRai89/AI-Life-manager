import { describe, it, expect } from "vitest";
import { buildHealthFlags } from "../src/services/ai/promptTemplate.js";

describe("Privacy Guarantees: Health Flags Abstraction", () => {
  const sensitiveUser = {
    consent: {
      aiPersonalization: true,
    },
    medicalReport: {
      conditions: ["Severe Chronic Asthma", "Hypertension Stage 2"],
      allergies: ["Peanuts and Tree Nuts"],
      medications: ["Albuterol Inhaler 90mcg PRN", "Lisinopril 20mg daily"],
      notes: "Patient experiences severe morning shortness of breath and recovering from ACL knee surgery.",
    },
  };

  it("buildHealthFlags returns nothing when consent.aiPersonalization is false or missing", () => {
    // False consent
    const userNoConsent = {
      ...sensitiveUser,
      consent: { aiPersonalization: false },
    };
    expect(buildHealthFlags(userNoConsent)).toEqual([]);

    // Missing consent object
    const userMissingConsent = {
      ...sensitiveUser,
      consent: undefined,
    };
    expect(buildHealthFlags(userMissingConsent)).toEqual([]);

    // Null user
    expect(buildHealthFlags(null)).toEqual([]);
  });

  it("with consent on, the output never contains raw conditions, medications or notes text", () => {
    const flags = buildHealthFlags(sensitiveUser);

    expect(flags.length).toBeGreaterThan(0);

    const flagsCombined = flags.join(" ").toLowerCase();

    // Verify raw conditions are never passed through verbatim
    for (const condition of sensitiveUser.medicalReport.conditions) {
      expect(flagsCombined).not.toContain(condition.toLowerCase());
    }

    // Verify raw medications are never passed through verbatim
    for (const med of sensitiveUser.medicalReport.medications) {
      expect(flagsCombined).not.toContain(med.toLowerCase());
    }

    // Verify raw notes text is never passed through verbatim
    expect(flagsCombined).not.toContain(sensitiveUser.medicalReport.notes.toLowerCase());
    expect(flagsCombined).not.toContain("patient experiences");
    expect(flagsCombined).not.toContain("acl knee surgery");
    expect(flagsCombined).not.toContain("albuterol inhaler");
    expect(flagsCombined).not.toContain("lisinopril");
    expect(flagsCombined).not.toContain("severe chronic asthma");
  });
});

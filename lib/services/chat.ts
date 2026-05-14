export function getMockStudentSupportResponse(question: string) {
  // Future AI/API integration: this keyword router can be replaced by an API route
  // that calls a model with retrieval from verified Australian student resources.
  const text = question.toLowerCase();

  if (text.includes("rent")) {
    return "For rental safety, inspect before paying, avoid cash-only requests, ask how bond will be lodged, keep written records, and compare the rent with similar rooms in the suburb. If anything feels rushed or unclear, pause before transferring money.";
  }

  if (text.includes("job")) {
    return "For part-time jobs, prepare a one-page Australian-style resume, make your availability clear, apply for roles near campus or transport, practise customer-service examples, and keep records of hours and payslips.";
  }

  if (text.includes("budget") || text.includes("afford") || text.includes("money") || text.includes("cost")) {
    return "For budgeting, estimate rent weekly, convert recurring costs to monthly, separate essential spending first, limit eating out while settling in, and keep a small emergency buffer for transport, health, or housing surprises.";
  }

  if (text.includes("visa") || text.includes("work-hour") || text.includes("work hour") || text.includes("compliance")) {
    return "For visa and compliance questions, SettleMate AI can only provide general reminders. Check official Australian Government sources, your institution, or a registered migration agent for advice about your specific situation.";
  }

  return "I can help you break this into a practical next step. Start with the most urgent risk: housing, money, study, work, transport, or wellbeing. Then use the matching SettleMate tool to create a clearer plan.";
}

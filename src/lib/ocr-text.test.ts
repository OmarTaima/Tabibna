import assert from "node:assert/strict";
import {
  formatDimensions,
  formatFileSize,
  redactPersonalData,
  truncateOcrText,
} from "./ocr-text";

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

const syntheticReport =
  "Aortic valve area 0.8 cm². Peak aortic velocity 4.1 m/s. Mean pressure gradient 42 mmHg. Concentric LVH, wall thickness 14 mm, LVEF 60%. Mild mitral regurgitation. Severe MS with moderate MR.";

try {
  assert.deepEqual(truncateOcrText("Short synthetic report text."), {
    text: "Short synthetic report text.",
    truncated: false,
  });
  assert.deepEqual(truncateOcrText("x".repeat(4000)), {
    text: "x".repeat(4000),
    truncated: false,
  });
  passed("truncateOcrText keeps reports at or below the limit untouched");

  const longReport = Array.from(
    { length: 120 },
    (_, index) => `Measurement line ${index + 1}: synthetic value ${index} mmHg.`,
  ).join("\n");
  const trimmedReport = truncateOcrText(longReport);

  assert.equal(trimmedReport.truncated, true);
  assert.ok(trimmedReport.text.length <= 4000);
  assert.ok(longReport.startsWith(trimmedReport.text));
  assert.ok(trimmedReport.text.endsWith("mmHg."));
  assert.ok(trimmedReport.text.split("\n").length > 10);
  passed("truncateOcrText cuts long reports at the last line break before the limit");

  const hardCut = truncateOcrText("y".repeat(4500));
  assert.equal(hardCut.truncated, true);
  assert.equal(hardCut.text.length, 4000);
  passed("truncateOcrText hard-cuts text without line breaks");

  assert.equal(
    redactPersonalData("Patient Name: TEST PATIENT"),
    "Patient Name: [redacted]",
  );
  assert.equal(
    redactPersonalData("Patient ID: 123456\nMRN: 98765"),
    "Patient ID: [redacted]\nMRN: [redacted]",
  );
  assert.equal(
    redactPersonalData("Dr. Test Operator"),
    "[redacted]",
  );
  assert.equal(
    redactPersonalData("Reviewed by Dr. Test Operator today."),
    "Reviewed by [redacted] today.",
  );
  assert.equal(
    redactPersonalData(
      "Patient: TEST PATIENT\nAge: 51 yr.\nDate: 17/10/2026\nOperator: Dr. Test Operator",
    ),
    "Patient: [redacted]\nAge: [redacted]\nDate: [redacted]\nOperator: [redacted]",
  );
  assert.equal(
    redactPersonalData("اسم المريض: مريض تجريبي"),
    "اسم المريض: [redacted]",
  );
  assert.equal(redactPersonalData("د. طبيب تجريبي"), "[redacted]");
  assert.equal(
    redactPersonalData("Contact: test.patient@example.com"),
    "Contact: [redacted]",
  );
  passed("redactPersonalData removes labeled names, ids, honorifics, emails, and demographics");

  assert.equal(redactPersonalData(syntheticReport), syntheticReport);
  assert.equal(
    redactPersonalData("Impression: severe aortic stenosis with concentric LVH."),
    "Impression: severe aortic stenosis with concentric LVH.",
  );
  const onceRedacted = redactPersonalData(
    "Patient Name: TEST PATIENT\nDr. Test Operator\nاسم المريض: مريض تجريبي",
  );
  assert.equal(redactPersonalData(onceRedacted), onceRedacted);
  passed("redactPersonalData leaves medical terms, measurements, and repeat runs intact");

  assert.equal(formatFileSize(2_516_582), "2.4 MB");
  assert.equal(formatFileSize(10 * 1024 * 1024), "10.0 MB");
  assert.equal(formatFileSize(512_000), "500 KB");
  passed("formatFileSize uses one decimal for megabytes and none for kilobytes");

  assert.equal(formatDimensions(1842, 2560), "1,842 × 2,560 px");
  passed("formatDimensions renders grouped dimensions");

  console.log("All client OCR text tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

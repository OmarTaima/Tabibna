import assert from "node:assert/strict";

const { AI_SYSTEM_PROMPT, buildUserPrompt } = await import("../src/ai/prompt.ts");

function passed(name: string): void {
  console.log(`ok - ${name}`);
}

try {
  assert.ok(
    AI_SYSTEM_PROMPT.includes("concise clinical restatement, not a literal translation"),
    "prompt should define normalized as a clinical restatement",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'EN: "Pain involving the back, with lower back pain and associated paresthesia."',
    ),
    "prompt should include the preferred English clinical phrasing example",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'AR: "ألم في الظهر، مع ألم في أسفل الظهر وتنميل."',
    ),
    "prompt should include the preferred Arabic clinical phrasing example",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Never write "Back pain with low back pain" or repeat "ألم في الظهر مع ألم في أسفل الظهر"',
    ),
    "prompt should forbid repetitive back pain phrasing when both locations are stated",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("not a template or expected output for any input"),
    "prompt should mark the style example as illustrative only",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("the restatement must not mention them either"),
    "prompt should forbid copying details that the input does not state",
  );
  passed("normalized clinical phrasing rules and guarded style example");

  assert.ok(AI_SYSTEM_PROMPT.includes('"Paresthesia" / "تنميل"'));
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "Abnormal skin sensation such as tingling, prickling, or numbness.",
    ),
    "paresthesia explanation should mention tingling, prickling, and numbness",
  );
  assert.ok(AI_SYSTEM_PROMPT.includes('"Low back pain" / "ألم أسفل الظهر"'));
  assert.ok(AI_SYSTEM_PROMPT.includes("lumbar pain or lumbalgia"));
  assert.ok(AI_SYSTEM_PROMPT.includes('"Back pain" / "ألم الظهر"'));
  assert.ok(
    AI_SYSTEM_PROMPT.includes("return \"Back pain\" and \"Low back pain\" as two separate terms"),
    "general and lower back pain should stay separate",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "Never add radiation, sciatica, radiculopathy, weakness, or a named disease or syndrome",
    ),
    "prompt should forbid unsupported escalation",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Always spell the Arabic term for paresthesia exactly as "تنميل" in every field: normalized, terminology, explanations, clarifications, and basis.',
    ),
    "prompt should require the exact Arabic paresthesia spelling in every field",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('Never write "تنمل"'),
    "prompt should forbid the Arabic misspelling تنمل",
  );
  assert.ok(
    !AI_SYSTEM_PROMPT.includes('"Paresthesia" / "تنمل"'),
    "prompt should not pair Paresthesia with the misspelling تنمل",
  );
  passed("terminology precision for paresthesia and back pain");

  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "leg weakness, saddle numbness, or bowel or bladder changes",
    ),
    "prompt should request a targeted clarification for back pain with numbness",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("Keep the total at 5 or fewer"),
    "clarification cap should stay explicit",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'label EN "Possible nerve involvement" / AR "احتمال تأثر الأعصاب"',
    ),
    "clinical interpretation label should use cautious bilingual wording",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'detail EN "Back pain combined with paresthesia may reflect nerve involvement, but this is a pattern observation, not a diagnosis."',
    ),
    "clinical interpretation detail should state pattern observation and uncertainty",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'AR "قد يشير ألم الظهر المصحوب بالتنميل إلى تأثر الأعصاب، لكن هذه ملاحظة لنمط الأعراض وليست تشخيصًا."',
    ),
    "clinical interpretation Arabic detail should use nerve involvement wording",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Never use "nerve injury", "إصابة عصبية", "nerve damage", "تلف الأعصاب"',
    ),
    "prompt should forbid structural-injury wording",
  );
  assert.ok(
    !AI_SYSTEM_PROMPT.includes('"Possible nerve involvement" / "إصابة عصبية"'),
    "prompt should not pair the preferred label with the forbidden Arabic wording",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('do not use terms such as "sciatica" or "radiculopathy"'),
    "clinical interpretations must not name conditions",
  );
  passed("targeted clarifications and cautious clinical interpretations");

  assert.ok(
    AI_SYSTEM_PROMPT.includes('"مخدتين أو ثلاثة" must remain "two or three pillows"'),
    "prompt should preserve the stated pillow range",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('must never become "three pillows"'),
    "prompt should forbid collapsing a stated alternative into one value",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('"Sometimes" must not become "always"'),
    "prompt should forbid upgrading a stated frequency",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('"Once" must not become recurrent'),
    "prompt should forbid turning a single episode into a recurrent pattern",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Keep negation and absence exactly as stated. "Never" and "cannot" must stay negative',
    ),
    "prompt should preserve stated negation",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("Keep every stated severity word in normalized in both languages"),
    "prompt should preserve stated severity words",
  );
  passed("ranges, alternatives, frequency, and negation are preserved");

  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'orthopnea = "ضيق النفس عند الاستلقاء", never "تقوس النفس"',
    ),
    "prompt should map orthopnea to standard Arabic wording",
  );
  assert.ok(
    !AI_SYSTEM_PROMPT.includes('orthopnea = "تقوس النفس"'),
    "prompt should never map orthopnea to the incorrect Arabic wording",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'paroxysmal nocturnal dyspnea = "ضيق النفس الانتيابي الليلي"',
    ),
    "prompt should map paroxysmal nocturnal dyspnea to standard Arabic wording",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('paresthesia = "تنميل"'),
    "prompt should keep the standard Arabic paresthesia term",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('wheezing = "أزيز" or "صفير"'),
    "prompt should map wheezing to standard Arabic wording",
  );
  passed("standard Arabic terminology mappings");

  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      '"دور برد في صدري" means recurrent chest colds or chest infections, not chest tightness',
    ),
    "prompt should interpret chest colds idiom as recurrent chest infections",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('"تزييق" in the chest means wheezing'),
    "prompt should interpret تزييق as wheezing",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "Never add chest tightness, chest pain, or chest pressure unless the description states it",
    ),
    "prompt should forbid adding chest tightness that was not stated",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "A reported fall or near-fall is not syncope unless the description states loss of consciousness",
    ),
    "prompt should forbid escalating a fall to syncope",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes('use "Presyncope" / "شبه إغماء"'),
    "prompt should prefer presyncope for a stated near-fall",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Do not use speculative severity labels such as "hemodynamic instability", "shock"',
    ),
    "prompt should forbid speculative severity labels",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("state the uncertainty explicitly"),
    "prompt should require explicit uncertainty in clinical interpretations",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'Never use "syndrome", "dysfunction", "failure", "disease", or "disorder"',
    ),
    "prompt should forbid diagnosis-level wording in clinical interpretations",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      'never name a body-system diagnosis such as "left ventricular dysfunction" or "heart failure"',
    ),
    "prompt should forbid naming a body-system diagnosis",
  );
  passed("chest symptom idioms and cautious severity language");

  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "Do not provide emergency numbers, first aid, or your own safety advice; simply omit any such content from every field.",
    ),
    "prompt should forbid emergency numbers, first aid, and model-invented safety advice",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes(
      "Never add emergency numbers, first aid, or your own safety advice to a question; simply omit that content.",
    ),
    "prompt should forbid safety advice inside clarification questions",
  );
  assert.ok(
    !AI_SYSTEM_PROMPT.includes("safety guidance"),
    "prompt must not promise that the application attaches separate safety guidance",
  );
  passed("prompt omits emergency numbers, first aid, and model-invented safety advice");

  assert.ok(
    AI_SYSTEM_PROMPT.includes("up to 10"),
    "terminology cap should match the shared schema",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("terminology: 0 to 10 items."),
    "terminology output limit should be 10",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("clarifications: 0 to 5 items."),
    "clarifications output limit should be 5",
  );
  assert.ok(
    AI_SYSTEM_PROMPT.includes("clinicalInterpretations: 0 to 3 items."),
    "clinical interpretation output limit should stay at 3",
  );
  passed("output limits match the shared AI schema caps");

  const description = "يؤلمني ظهري وأعاني من ألم في أسفل الظهر وتنميل.";
  const userPrompt = buildUserPrompt(description, "ar");
  assert.ok(userPrompt.includes(description), "user prompt should preserve the description");
  assert.ok(userPrompt.includes('"interfaceLocale":"ar"'));
  assert.ok(userPrompt.includes("untrusted patient description"));
  assert.ok(!userPrompt.includes("sk-"), "user prompt should never embed credentials");
  passed("user prompt keeps the description as JSON data");

  console.log("All server prompt tests passed.");
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}

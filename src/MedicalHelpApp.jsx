// Medical Help App – AI-Enabled Prototype (OpenRouter with stable model)

import React, { useState } from 'react';
import { Card, CardContent } from "./components/ui/card.js";
import { Button } from "./components/ui/button.js";
import { Input } from "./components/ui/input.js";
import { Textarea } from "./components/ui/textarea.js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select.js";

export default function MedicalHelpApp() {
  const [symptomInput, setSymptomInput] = useState('');
  const [reportResult, setReportResult] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [aiAdvice, setAiAdvice] = useState('');
  const [role, setRole] = useState('Patient');
  const [language, setLanguage] = useState('English');
  const [doctorOpinion, setDoctorOpinion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSymptomSubmit = async () => {
    if (!symptomInput) return;
    setLoading(true);
    try {
      const prompt = `You are a medical assistant helping people understand their symptoms. A user reports the following symptoms: ${symptomInput}.

Your task is to:
1. Explain possible conditions in simple layman-friendly language.
2. Suggest basic home remedies or OTC medications if applicable.
3. Mention any red flags that require immediate doctor attention.
4. If serious, suggest seeking a doctor's opinion with reasoning.`;

      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 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"
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await res.json();
      console.log("AI response:", data);

      let reply = data?.choices?.[0]?.message?.content?.trim();
      if (!reply) {
        reply = JSON.stringify(data, null, 2);
      }

      setAiAdvice(reply);
      setTimeline(prev => [...prev, { type: 'Symptom', value: symptomInput, advice: reply }]);
    } catch (err) {
      console.error("AI error:", err);
      setAiAdvice("⚠️ Error: AI could not respond. Please try again later.");
    } finally {
      setLoading(false);
      setSymptomInput('');
    }
  };

  const handleReportUpload = (e) => {
    const fileName = e.target.files[0]?.name;
    const result = language === 'Hindi'
      ? `रिपोर्ट ${fileName} अपलोड हो गई है। Creatinine स्तर: 2.1 mg/dL (उच्च)।`
      : `Report ${fileName} uploaded. Creatinine: 2.1 mg/dL (high).`;
    setReportResult(result);
    setTimeline(prev => [...prev, { type: 'Report', value: result }]);
  };

  const handleDoctorOpinion = () => {
    const opinion = language === 'Hindi'
      ? `डॉक्टर की सलाह: रक्तचाप की निगरानी करें और रिपोर्ट भेजें।`
      : `Doctor's opinion: Monitor blood pressure and send updates.`;
    setDoctorOpinion(opinion);
    setTimeline(prev => [...prev, { type: 'Doctor Opinion', value: opinion }]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🩺 Smart Health Assistant</h1>

      <div className="mb-4 flex gap-4">
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Patient">Patient</SelectItem>
            <SelectItem value="Family">Family Member</SelectItem>
            <SelectItem value="Doctor">Doctor</SelectItem>
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Hindi">Hindi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="symptoms">
        <TabsList className="mb-4">
          <TabsTrigger value="symptoms">Symptom Checker</TabsTrigger>
          <TabsTrigger value="reports">Upload Report</TabsTrigger>
          <TabsTrigger value="opinion">Doctor Opinion</TabsTrigger>
          <TabsTrigger value="timeline">Health Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="symptoms">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Textarea
                placeholder="Describe your symptoms..."
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
              />
              <Button onClick={handleSymptomSubmit} disabled={loading}>
                {loading ? "Consulting AI..." : "Get Guidance"}
              </Button>
              {aiAdvice && <p className="mt-2 text-green-700 whitespace-pre-line">{aiAdvice}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Input type="file" onChange={handleReportUpload} />
              {reportResult && <p className="text-blue-700">{reportResult}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opinion">
          <Card>
            <CardContent className="space-y-4 p-4">
              <Button onClick={handleDoctorOpinion}>Request Doctor Opinion</Button>
              {doctorOpinion && <p className="text-purple-700">{doctorOpinion}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardContent className="p-4 space-y-2">
              {timeline.length === 0 ? <p>No health records yet.</p> :
                timeline.map((entry, index) => (
                  <div key={index} className="border p-2 rounded-md">
                    <p className="font-semibold">{entry.type}</p>
                    <p>{entry.value}</p>
                    {entry.advice && <p className="text-sm text-gray-600">Advice: {entry.advice}</p>}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

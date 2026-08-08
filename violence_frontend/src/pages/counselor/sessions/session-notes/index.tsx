import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  FileText,
  Clock,
  User,
  Calendar,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Edit,
  Download,
  Plus,
  Minus,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useParams } from 'react-router-dom';

const mockSessionData = {
  id: 'session-1',
  clientName: 'Sarah M.',
  clientId: 'client-1',
  date: '2024-01-20',
  time: '10:00 AM',
  duration: 60,
  type: 'Individual Counseling',
  location: 'Virtual - Secure Video',
  status: 'Completed',
  counselor: 'Grace Thompson',
};

const mockExistingNotes = {
  sessionOverview:
    'Client presented with ongoing anxiety symptoms related to recent trauma experience. Discussed coping strategies and safety planning.',
  clientGoals:
    '1. Reduce anxiety symptoms\n2. Develop safety plan\n3. Build support network',
  interventions:
    'CBT techniques for anxiety management, grounding exercises, safety planning discussion',
  progress:
    'Client showed good engagement with CBT techniques. Demonstrated understanding of grounding exercises and committed to practicing them daily.',
  homework:
    'Practice grounding exercises 3x daily, complete safety plan worksheet, identify 3 support people',
  followUp:
    'Schedule follow-up in 1 week to review progress and adjust interventions as needed',
  riskAssessment:
    'Low immediate risk. Client has strong support system and safety plan in place.',
  notes:
    'Client was cooperative and engaged throughout session. Expressed hope about therapy process. Good therapeutic alliance established.',
};

function SessionNotesPage() {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState(mockExistingNotes);
  const [newGoal, setNewGoal] = useState('');
  const [newIntervention, setNewIntervention] = useState('');

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsEditing(false);
    alert('Session notes saved successfully!');
    setIsLoading(false);
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setNotes((prev) => ({
        ...prev,
        clientGoals:
          prev.clientGoals +
          '\n' +
          (prev.clientGoals.split('\n').length + 1) +
          '. ' +
          newGoal.trim(),
      }));
      setNewGoal('');
    }
  };

  const handleAddIntervention = () => {
    if (newIntervention.trim()) {
      setNotes((prev) => ({
        ...prev,
        interventions: prev.interventions + '; ' + newIntervention.trim(),
      }));
      setNewIntervention('');
    }
  };

  const progressOptions = [
    'Significant Improvement',
    'Moderate Improvement',
    'Minimal Change',
    'No Change',
    'Slight Decline',
  ];

  const riskLevels = [
    'Low Risk',
    'Moderate Risk',
    'High Risk',
    'Critical Risk',
  ];

  return (
    <div className="min-h-screen bg-[var(--role-counselor-bg)] p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Link to="/counselor/sessions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sessions
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-[var(--role-counselor-primary)]" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Session Notes
                </h1>
                <p className="mt-1 text-slate-600">
                  Session #{id} - {mockSessionData.clientName}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notes
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-[var(--role-counselor-primary)] hover:bg-[var(--role-counselor-primary)]/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save Notes'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">{mockSessionData.clientName}</p>
                  <p className="text-sm text-slate-500">Client</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">{mockSessionData.date}</p>
                  <p className="text-sm text-slate-500">Date</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium">{mockSessionData.time}</p>
                  <p className="text-sm text-slate-500">
                    {mockSessionData.duration} minutes
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-100 text-emerald-800">
                  {mockSessionData.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Session Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Session Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={notes.sessionOverview}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        sessionOverview: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Describe the main topics and focus of this session..."
                  />
                ) : (
                  <p className="text-slate-700">{notes.sessionOverview}</p>
                )}
              </CardContent>
            </Card>

            {/* Client Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Client Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <Textarea
                      value={notes.clientGoals}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          clientGoals: e.target.value,
                        }))
                      }
                      rows={6}
                      placeholder="List the client's goals and objectives..."
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newGoal}
                        onChange={(e) => setNewGoal(e.target.value)}
                        placeholder="Add new goal..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                      />
                      <Button onClick={handleAddGoal} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {notes.clientGoals.split('\n').map((goal, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
                        <p className="text-slate-700">{goal}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interventions Used */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Interventions Used
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <>
                    <Textarea
                      value={notes.interventions}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          interventions: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Describe interventions and techniques used..."
                    />
                    <div className="flex gap-2">
                      <Input
                        value={newIntervention}
                        onChange={(e) => setNewIntervention(e.target.value)}
                        placeholder="Add intervention..."
                        onKeyPress={(e) =>
                          e.key === 'Enter' && handleAddIntervention()
                        }
                      />
                      <Button onClick={handleAddIntervention} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    {notes.interventions
                      .split(';')
                      .map((intervention, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--role-counselor-accent)]"></div>
                          <p className="text-slate-700">
                            {intervention.trim()}
                          </p>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Progress Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Progress Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Overall Progress
                      </label>
                      <Select
                        value={notes.progress}
                        onValueChange={(value) =>
                          setNotes((prev) => ({ ...prev, progress: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {progressOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={notes.progress}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          progress: e.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Describe progress made and areas for improvement..."
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    <Badge className="bg-[var(--role-counselor-accent)]/20 text-[var(--role-counselor-accent)]">
                      {notes.progress.split('.')[0]}
                    </Badge>
                    <p className="text-slate-700">{notes.progress}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Risk Level
                      </label>
                      <Select
                        value={notes.riskAssessment}
                        onValueChange={(value) =>
                          setNotes((prev) => ({
                            ...prev,
                            riskAssessment: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {riskLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Textarea
                      value={notes.riskAssessment}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          riskAssessment: e.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Assess current risk level and safety concerns..."
                    />
                  </>
                ) : (
                  <div className="space-y-3">
                    <Badge
                      className={(status) => {
                        switch (status) {
                          case 'Low':
                            return 'bg-[var(--role-counselor-secondary)]/20 text-[var(--role-counselor-text)]';
                          case 'Moderate':
                            return 'bg-amber-100 text-amber-800';
                          case 'High':
                            return 'bg-[var(--role-counselor-primary)]/20 text-white';
                          default:
                            return 'bg-slate-100 text-slate-800';
                        }
                      }}
                    >
                      {notes.riskAssessment.split('.')[0]}
                    </Badge>
                    <p className="text-slate-700">{notes.riskAssessment}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Homework/Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Homework & Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={notes.homework}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        homework: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Assign homework or between-session activities..."
                  />
                ) : (
                  <div className="space-y-2">
                    {notes.homework.split('\n').map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500"></div>
                        <p className="text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Follow-up Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Follow-up Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={notes.followUp}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        followUp: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Plan next session and follow-up actions..."
                  />
                ) : (
                  <p className="text-slate-700">{notes.followUp}</p>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={notes.notes}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    rows={4}
                    placeholder="Any additional observations or notes..."
                  />
                ) : (
                  <p className="text-slate-700">{notes.notes}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SessionNotesPage;

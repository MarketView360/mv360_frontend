"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield } from "lucide-react";

interface PersonalInfoFormProps {
  email: string;
  displayName: string;
  fullName: string;
  onDisplayNameChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  errors?: {
    displayName?: string;
    fullName?: string;
  };
}

export function PersonalInfoForm({
  email,
  displayName,
  fullName,
  onDisplayNameChange,
  onFullNameChange,
  errors,
}: PersonalInfoFormProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300">
              Display Name
            </Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => onDisplayNameChange(e.target.value)}
              placeholder="How should we call you?"
              className={`bg-white dark:bg-slate-800 ${errors?.displayName ? "border-red-500" : ""}`}
              maxLength={100}
            />
            {errors?.displayName ? (
              <p className="text-xs text-red-500">{errors.displayName}</p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                This is how your name appears across the platform
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Your full name"
              className={`bg-white dark:bg-slate-800 ${errors?.fullName ? "border-red-500" : ""}`}
              maxLength={100}
            />
            {errors?.fullName ? (
              <p className="text-xs text-red-500">{errors.fullName}</p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Used for official communications
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 dark:text-slate-300">Email Address</Label>
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-md border border-slate-200 dark:border-slate-700">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600 dark:text-slate-300">{email}</span>
            </div>
            <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
              <Shield className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            To change your email, please contact support
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

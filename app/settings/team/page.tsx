import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, User } from "lucide-react";

export default function TeamSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Team Management</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your team members and their permissions.
                </p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Invite Members</CardTitle>
                    <CardDescription>
                        Invite new members to your workspace via email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-end gap-4">
                        <div className="grid gap-2 flex-1">
                            <Label htmlFor="email">Email address</Label>
                            <Input id="email" placeholder="colleague@example.com" type="email" />
                        </div>
                        <div className="grid gap-2 w-[180px]">
                            <Label htmlFor="role">Role</Label>
                            <select
                                id="role"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Invite
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                        People with access to this workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Mock Member 1 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">You</p>
                                    <p className="text-sm text-muted-foreground">admin@example.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Owner</span>
                            </div>
                        </div>
                        <Separator />

                        {/* Mock Member 2 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <span className="font-medium text-muted-foreground">JD</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium leading-none">Jane Doe</p>
                                    <p className="text-sm text-muted-foreground">jane@example.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">Member</span>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">Remove</Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

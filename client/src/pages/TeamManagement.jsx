import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const TeamManagement = () => {
    const { user } = useAuthStore();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [creatingTeam, setCreatingTeam] = useState(false);
    const [teamName, setTeamName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchTeam = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/teams/me');
            setTeam(data);
        } catch (err) {
            console.error('No team found or error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeam();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setCreatingTeam(true);
            const { data } = await api.post('/teams', { name: teamName });
            setTeam(data.team);
            user.teamId = data.team._id; // Quick hack to sync local state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create team');
        } finally {
            setCreatingTeam(false);
        }
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setSuccess('');
            const { data } = await api.post('/teams/invite', { email: inviteEmail, role: inviteRole });
            setSuccess(`Invite sent to ${inviteEmail} (Link: /invite/${data.inviteToken})`);
            setInviteEmail('');
            fetchTeam();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invite');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Spinner /></div>;
    }

    if (!team) {
        return (
            <div className="max-w-xl mx-auto py-12 px-6">
                <Card className="p-8 text-center bg-white shadow-minimal">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-board-heading mb-2">Create a Workspace</h2>
                    <p className="text-board-textSecondary mb-8 max-w-sm mx-auto">
                        Collaborate with your co-founders and team members in shared boardroom sessions.
                    </p>

                    <form onSubmit={handleCreateTeam} className="text-left space-y-4 max-w-sm mx-auto">
                        <Input
                            label="Workspace Name"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            required
                        />
                        {error && <p className="text-sm text-board-danger">{error}</p>}
                        <Button type="submit" variant="primary" className="w-full" isLoading={creatingTeam}>
                            Create Workspace
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    const isOwner = team.owner === user._id || team.owner._id === user._id;

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-board-heading">{team.name} Settings</h1>
                <p className="text-board-textSecondary mt-1">Manage your team workspace and member access.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Team Roster */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden">
                        <div className="px-6 py-4 border-b border-board-border bg-board-bgSecondary">
                            <h3 className="text-sm font-semibold text-board-heading">Team Members ({team.members.length})</h3>
                        </div>
                        <ul className="divide-y divide-board-border">
                            {team.members.map((member) => (
                                <li key={member.user._id || member.user} className="px-6 py-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-board-primary font-bold">
                                            {member.user.name ? member.user.name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-board-heading">{member.user.name || 'Team Member'}</p>
                                            <p className="text-xs text-board-textSecondary">{member.user.email || 'Email hidden'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${member.role === 'owner' ? 'bg-board-primary/10 text-board-primary' :
                                                member.role === 'editor' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Pending Invites */}
                    {team.invites && team.invites.length > 0 && (
                        <Card className="p-0 overflow-hidden">
                            <div className="px-6 py-4 border-b border-board-border bg-board-bgSecondary">
                                <h3 className="text-sm font-semibold text-board-heading">Pending Invites</h3>
                            </div>
                            <ul className="divide-y divide-board-border">
                                {team.invites.map((invite, i) => (
                                    <li key={i} className="px-6 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-board-heading">{invite.email}</p>
                                            <p className="text-xs text-board-textSecondary">Role: {invite.role} • Expires in {Math.round((new Date(invite.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                                        </div>
                                        <div>
                                            <span className="text-xs text-board-warning font-medium">Pending</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                {/* Invite Controls */}
                <div className="md:col-span-1">
                    {isOwner ? (
                        <Card className="p-6">
                            <h3 className="text-sm font-semibold text-board-heading mb-4 border-b border-board-border pb-2">Invite Member</h3>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-board-textMain mb-1.5">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="block w-full rounded-lg border border-board-border text-board-textMain px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-board-primary/20 focus:border-board-primary sm:text-sm"
                                    >
                                        <option value="editor">Editor (Can create sessions)</option>
                                        <option value="viewer">Viewer (Read-only)</option>
                                    </select>
                                </div>
                                {error && <p className="text-sm text-board-danger">{error}</p>}
                                {success && <p className="text-sm text-board-success bg-green-50 p-2 rounded border border-green-100">{success}</p>}
                                <Button type="submit" variant="primary" className="w-full">
                                    Send Invite
                                </Button>
                            </form>
                        </Card>
                    ) : (
                        <Card className="p-6 bg-board-bgSecondary text-center border-dashed">
                            <p className="text-sm text-board-textSecondary">Only the Workspace Owner can invite new members.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;

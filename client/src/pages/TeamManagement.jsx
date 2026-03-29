import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const TeamManagement = () => {
    const { user, checkAuth } = useAuthStore();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('editor');
    const [creatingTeam, setCreatingTeam] = useState(false);
    const [removingUserId, setRemovingUserId] = useState(null);
    const [withdrawingToken, setWithdrawingToken] = useState(null);
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
            await checkAuth(); // Sync local user state
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create workspace');
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
            
            // Generate full URL
            const inviteUrl = `${window.location.origin}/invite/${data.inviteToken}`;
            
            setSuccess(`Invite generated successfully! Sent to ${inviteEmail} \n Link: ${inviteUrl}`);
            setInviteEmail('');
            fetchTeam();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invite');
        }
    };

    const handleRemoveMember = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        
        try {
            setRemovingUserId(memberId);
            await api.delete(`/teams/members/${memberId}`);
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove member');
        } finally {
            setRemovingUserId(null);
        }
    };

    const handleWithdrawInvite = async (token) => {
        if (!window.confirm("Are you sure you want to withdraw this invite?")) return;
        
        try {
            setWithdrawingToken(token);
            await api.delete(`/teams/invite/${token}`);
            fetchTeam();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to withdraw invite');
        } finally {
            setWithdrawingToken(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Spinner />
            </div>
        );
    }

    if (!team) {
        return (
            <div className="max-w-xl mx-auto py-16 px-6 relative">
                 {/* Decorative background blurs for premium feel */}
                 <div className="absolute top-0 left-10 w-64 h-64 bg-board-primary/5 rounded-full blur-3xl -z-10"></div>
                 <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl -z-10"></div>
                 
                <Card className="p-10 text-center bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
                    <div className="w-20 h-20 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <svg className="w-10 h-10 text-board-primary opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-medium text-board-heading mb-3 tracking-tight">Create your Workspace</h2>
                    <p className="text-board-textSecondary mb-10 max-w-sm mx-auto text-[15px] leading-relaxed">
                        Collaborate with your co-founders and execute strategy in shared boardroom sessions.
                    </p>

                    <form onSubmit={handleCreateTeam} className="text-left space-y-6 max-w-sm mx-auto">
                        <div>
                            <Input
                                label="Workspace Name"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="e.g. Acme Corp"
                                required
                                className="bg-gray-50/50 border-gray-200"
                            />
                        </div>
                        {error && <p className="text-sm text-board-danger bg-red-50/50 p-3 rounded-lg border border-red-100/50 font-medium">{error}</p>}
                        <Button type="submit" variant="primary" className="w-full py-2.5 font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5" isLoading={creatingTeam}>
                            Create Workspace
                        </Button>
                    </form>
                </Card>
            </div>
        );
    }

    const isOwner = team.owner === user._id || team.owner._id === user._id;

    return (
        <div className="max-w-5xl mx-auto py-12 px-6 relative">
             <div className="absolute top-0 right-0 w-96 h-96 bg-board-primary/5 rounded-full blur-3xl -z-10"></div>
            
            <div className="mb-10">
                <h1 className="text-3xl font-medium text-board-heading tracking-tight">{team.name} Workspace</h1>
                <p className="text-board-textSecondary mt-2 text-[15px]">Manage your team members and invitation links.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Team Roster */}
                    <Card className="p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl">
                        <div className="px-7 py-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h3 className="text-[15px] font-medium text-board-heading">Team Members ({team.members.length})</h3>
                        </div>
                        <ul className="divide-y divide-gray-50">
                            {team.members.map((member) => (
                                <li key={member.user._id || member.user} className="px-7 py-5 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-board-primary font-medium shadow-sm border border-blue-100/30">
                                            {member.user.name ? member.user.name.charAt(0) : 'U'}
                                        </div>
                                        <div>
                                            <p className="text-[15px] font-medium text-board-heading">{member.user.name || 'Team Member'} {member.user._id === user._id && <span className="text-xs ml-2 text-board-textSecondary bg-gray-100 px-2 py-0.5 rounded-full">You</span>}</p>
                                            <p className="text-sm text-board-textSecondary mt-0.5">{member.user.email || 'Email hidden'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.role === 'owner' ? 'bg-board-primary/10 text-board-primary' :
                                                member.role === 'editor' ? 'bg-green-50 text-green-700 border border-green-100/50' : 'bg-gray-50 text-gray-700 border border-gray-200/50'
                                            }`}>
                                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                        </span>
                                        {isOwner && member.user._id !== user._id && (
                                            <button 
                                                onClick={() => handleRemoveMember(member.user._id)}
                                                disabled={removingUserId === member.user._id}
                                                className="text-board-textSecondary hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 text-sm font-medium disabled:opacity-50"
                                            >
                                                {removingUserId === member.user._id ? 'Removing...' : 'Remove'}
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Pending Invites */}
                    {team.invites && team.invites.length > 0 && (
                        <Card className="p-0 overflow-hidden bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl">
                            <div className="px-7 py-5 border-b border-gray-100 bg-gray-50/30">
                                <h3 className="text-[15px] font-medium text-board-heading">Pending Invitations</h3>
                            </div>
                            <ul className="divide-y divide-gray-50">
                                {team.invites.map((invite, i) => (
                                    <li key={i} className="px-7 py-5 flex items-center justify-between hover:bg-gray-50/30 transition-colors">
                                        <div>
                                            <p className="text-[15px] font-medium text-board-heading">{invite.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[13px] text-board-textSecondary">Role: <span className="font-medium capitalize">{invite.role}</span></span>
                                                <span className="text-[13px] text-board-textSecondary">•</span>
                                                <span className="text-[13px] text-board-textSecondary">Expires in {Math.round((new Date(invite.expiresAt) - new Date()) / (1000 * 60 * 60 * 24))} days</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100/50">Pending</span>
                                            {isOwner && (
                                                <button 
                                                    onClick={() => handleWithdrawInvite(invite.token)}
                                                    disabled={withdrawingToken === invite.token}
                                                    className="text-board-textSecondary hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 text-xs font-medium disabled:opacity-50"
                                                >
                                                    {withdrawingToken === invite.token ? 'Withdrawing...' : 'Withdraw'}
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}
                </div>

                {/* Sidebar Controls */}
                <div className="lg:col-span-1">
                    {isOwner ? (
                        <Card className="p-7 bg-white/80 backdrop-blur-xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-2xl sticky top-24">
                            <h3 className="text-[15px] font-medium text-board-heading mb-5 flex items-center gap-2">
                                <svg className="w-4 h-4 text-board-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Invite New Member
                            </h3>
                            <form onSubmit={handleInvite} className="space-y-5">
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    required
                                    className="bg-gray-50/50"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-board-textMain mb-2">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={(e) => setInviteRole(e.target.value)}
                                        className="block w-full rounded-xl border border-gray-200 text-board-textMain px-4 py-2.5 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-board-primary/20 focus:border-board-primary transition-all text-sm font-medium"
                                    >
                                        <option value="editor">Editor (Create & edit sessions)</option>
                                        <option value="viewer">Viewer (Read-only access)</option>
                                    </select>
                                </div>
                                {error && <p className="text-sm font-medium text-board-danger bg-red-50/50 p-3 rounded-lg border border-red-100/50">{error}</p>}
                                {success && <p className="text-sm font-medium text-board-success bg-green-50/50 p-3 rounded-lg border border-green-100/50 whitespace-pre-wrap leading-relaxed break-all">{success}</p>}
                                <Button type="submit" variant="primary" className="w-full py-2.5 font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5">
                                    Send Invitation
                                </Button>
                            </form>
                        </Card>
                    ) : (
                        <Card className="p-7 bg-gray-50/50 text-center border border-gray-100 border-dashed rounded-2xl">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <p className="text-[15px] font-medium text-board-heading mb-1">Access Restricted</p>
                            <p className="text-sm text-board-textSecondary">Only the Workspace Owner can manage members and invites.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeamManagement;

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import SiteSettings from '../../components/admin/SiteSettings';
import Head from 'next/head';
import { FaTrash, FaPlus, FaSave, FaSignOutAlt, FaBriefcase, FaCode, FaEdit, FaTimes } from 'react-icons/fa';
import { defaultSiteContent, defaultSkillCategories, getSiteContent } from '../../lib/siteContent';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('profile');
  const [notice, setNotice] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [signingIn, setSigningIn] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();
    if (signingIn) return;
    const credentials = new FormData(event.currentTarget);
    setLoginError('');
    setSigningIn(true);
    try {
      const result = await signIn('credentials', {
        email: credentials.get('email'),
        password: credentials.get('password'),
        redirect: false,
      });
      if (result?.error === 'CredentialsSignin') {
        setLoginError('Check your email and password and try again.');
      } else if (!result?.ok) {
        setLoginError('Sign-in is unavailable. Check the server configuration and try again.');
      }
    } catch {
      setLoginError('Unable to reach the server. Try again.');
    } finally {
      setSigningIn(false);
    }
  }

  // Queries
  const { data: siteInfo, isError: siteInfoError, refetch: reloadsiteInfo } = useQuery(['siteInfo'], () => axios.get('/api/siteinfo?editor=1').then((r) => r.data), { enabled: !!session, refetchOnWindowFocus: false, staleTime: Infinity });
  const { data: projects, isError: projectsError, refetch: reloadprojects } = useQuery(['projects'], () => axios.get('/api/projects?editor=1').then((r) => r.data), { enabled: !!session && activeTab === 'projects' });
  const { data: services, isError: servicesError, refetch: reloadservices } = useQuery(['services'], () => axios.get('/api/services?editor=1').then((r) => r.data), { enabled: !!session && activeTab === 'services' });
  const { data: experiences, isError: experiencesError, refetch: reloadexperiences } = useQuery(['experience'], () => axios.get('/api/experience?editor=1').then((r) => r.data), { enabled: !!session && activeTab === 'experience' });

  // Mutations
  const updateSiteInfo = useMutation((payload) => axios.put('/api/siteinfo', payload).then((r) => r.data), {
    onSuccess: (data) => {
      queryClient.setQueryData(['siteInfo'], data);
      setNotice({ text: 'Website settings published.' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to save website settings.' }),
  });

  const addProject = useMutation((payload) => axios.post('/api/projects', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setProjForm({ title: '', description: '', techStack: [], demoUrl: '', repoUrl: '', imageUrl: '', imageAlt: '' });
      setEditingProject(null);
      setNotice({ text: 'Project added.' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to add project.' }),
  });

  const updateProject = useMutation((payload) => axios.put('/api/projects', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      setProjForm({ title: '', description: '', techStack: [], demoUrl: '', repoUrl: '', imageUrl: '', imageAlt: '' });
      setEditingProject(null);
      setNotice({ text: 'Project updated.' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to update project.' }),
  });

  const deleteProject = useMutation((id) => axios.delete(`/api/projects?id=${id}`), {
    onSuccess: () => { queryClient.invalidateQueries(['projects']); setNotice({ text: 'Project deleted.' }); },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to delete project.' }),
  });

  const addService = useMutation((payload) => axios.post('/api/services', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setServiceForm({ title: '', description: '', icon: 'FaCode', featuresString: '' });
      setEditingService(null);
      setNotice({ text: 'Service added!' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to add service.' }),
  });

  const updateService = useMutation((payload) => axios.put('/api/services', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setServiceForm({ title: '', description: '', icon: 'FaCode', featuresString: '' });
      setEditingService(null);
      setNotice({ text: 'Service updated!' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to update service.' }),
  });

  const deleteService = useMutation((id) => axios.delete(`/api/services?id=${id}`), {
    onSuccess: () => { queryClient.invalidateQueries(['services']); setNotice({ text: 'Service deleted.' }); },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to delete service.' }),
  });

  const addExperience = useMutation((payload) => axios.post('/api/experience', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['experience']);
      setExpForm({ role: '', company: '', location: '', period: '', description: '', techString: '' });
      setEditingExperience(null);
      setNotice({ text: 'Experience added!' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to add experience.' }),
  });

  const updateExperience = useMutation((payload) => axios.put('/api/experience', payload).then((r) => r.data), {
    onSuccess: () => {
      queryClient.invalidateQueries(['experience']);
      setExpForm({ role: '', company: '', location: '', period: '', description: '', techString: '' });
      setEditingExperience(null);
      setNotice({ text: 'Experience updated!' });
    },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to update experience.' }),
  });

  const deleteExperience = useMutation((id) => axios.delete(`/api/experience?id=${id}`), {
    onSuccess: () => { queryClient.invalidateQueries(['experience']); setNotice({ text: 'Experience deleted.' }); },
    onError: (error) => setNotice({ error: true, text: error.response?.data?.error || 'Unable to delete experience.' }),
  });

  // Forms
  const [siteForm, setSiteForm] = useState({
    name: '',
    tagline: '',
    bio: '',
    avatarUrl: '',
    contactEmail: '',
    phone: '',
    location: '',
    skills: [],
    socialLinks: { github: '', linkedin: '', twitter: '' },
    skillCategories: defaultSkillCategories,
    siteContent: defaultSiteContent,
  });

  const [newSkillInput, setNewSkillInput] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [editingExperience, setEditingExperience] = useState(null);
  const [projForm, setProjForm] = useState({
    title: '',
    description: '',
    techStack: [],
    demoUrl: '',
    repoUrl: '',
    imageUrl: '',
  });

  const [serviceForm, setServiceForm] = useState({
    title: '',
    description: '',
    icon: 'FaCode',
    featuresString: '',
  });

  const [expForm, setExpForm] = useState({
    role: '',
    company: '',
    location: '',
    period: '',
    description: '',
    techString: '',
  });

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingProjImg, setUploadingProjImg] = useState(false);

  useEffect(() => {
    if (siteInfo) {
      // The form keeps an editable draft synchronized with asynchronously loaded profile data.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSiteForm({
        name: siteInfo.name || '',
        tagline: siteInfo.tagline || '',
        bio: siteInfo.bio || '',
        avatarUrl: siteInfo.avatarUrl || '',
        contactEmail: siteInfo.contactEmail || '',
        phone: siteInfo.phone || '',
        location: siteInfo.location || '',
        skills: siteInfo.skills || [],
        socialLinks: { github: '', linkedin: '', twitter: '', ...(siteInfo.socialLinks || {}) },
        skillCategories: siteInfo.siteContent?.skills?.customCategories || siteInfo.skillCategories?.length
          ? siteInfo.skillCategories || [] : defaultSkillCategories,
        siteContent: getSiteContent(siteInfo),
      });
    }
  }, [siteInfo]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-md">
          <h2 className="text-2xl font-bold tracking-tight text-slate-50 text-center">Admin Portal Login</h2>
          <p className="mt-2 text-center text-sm text-slate-400">Sign in to manage and edit your portfolio</p>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <label className="block text-sm text-slate-200">
              Email
              <input name="email" type="email" autoComplete="username" required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" />
            </label>
            <label className="block text-sm text-slate-200">
              Password
              <input name="password" type="password" autoComplete="current-password" required
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2" />
            </label>
            {loginError && <p role="alert" className="text-sm text-rose-300">{loginError}</p>}
            <button type="submit" disabled={signingIn}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50">
              {signingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Upload Avatar
  async function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploadingAvatar(true);
    try {
      const res = await axios.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSiteForm((current) => ({ ...current, avatarUrl: res.data.url }));
    } catch (err) {
      console.error(err);
      setNotice({ error: true, text: err.response?.data?.error || 'Avatar upload failed.' });
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Upload Project Image
  async function handleProjImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    setUploadingProjImg(true);
    try {
      const res = await axios.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProjForm((current) => ({ ...current, imageUrl: res.data.url }));
    } catch (err) {
      console.error(err);
      setNotice({ error: true, text: err.response?.data?.error || 'Project image upload failed.' });
    } finally {
      setUploadingProjImg(false);
    }
  }

  // Skill management
  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    const updated = [...(siteForm.skills || []), newSkillInput.trim()];
    setSiteForm({ ...siteForm, skills: updated });
    setNewSkillInput('');
  };

  const handleDeleteSkill = (skillToDelete) => {
    const updated = siteForm.skills.filter((s) => s !== skillToDelete);
    setSiteForm({ ...siteForm, skills: updated });
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (uploadingAvatar || updateSiteInfo.isLoading || !siteForm.name.trim()) {
      if (!siteForm.name.trim()) setNotice({ error: true, text: 'Enter a name in Profile before publishing.' });
      return;
    }
    const list = (value) => Array.isArray(value) ? value : value.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
    setNotice(null);
    updateSiteInfo.mutate({
      ...siteForm,
      siteContent: {
        ...siteForm.siteContent,
        skills: { ...siteForm.siteContent.skills, customCategories: true },
        footer: { ...siteForm.siteContent.footer, services: list(siteForm.siteContent.footer.services) },
        marqueeSkills: list(siteForm.siteContent.marqueeSkills),
      },
    });
  };

  const updateSiteContentField = (section, field, value) => {
    setSiteForm((current) => ({
      ...current,
      siteContent: {
        ...current.siteContent,
        [section]: { ...current.siteContent[section], [field]: value },
      },
    }));
  };

  const updateSocialLink = (name, value) => {
    setSiteForm((current) => ({
      ...current,
      socialLinks: { ...current.socialLinks, [name]: value },
    }));
  };

  const updateSkillCategory = (index, field, value) => {
    setSiteForm((current) => ({
      ...current,
      skillCategories: current.skillCategories.map((category, categoryIndex) =>
        categoryIndex === index ? { ...category, [field]: value } : category
      ),
    }));
  };

  const contentGroups = [
    {
      title: 'Navigation',
      section: 'navigation',
      fields: [
        ['logoText', 'Logo text'],
        ['logoSuffix', 'Logo suffix'],
        ['homeLabel', 'Home link'],
        ['aboutLabel', 'About link'],
        ['servicesLabel', 'Services link'],
        ['skillsLabel', 'Skills link'],
        ['experienceLabel', 'Experience link'],
        ['projectsLabel', 'Projects link'],
        ['contactLabel', 'Contact link'],
        ['hireMeLabel', 'Hire Me button'],
      ],
    },
    {
      title: 'Home page',
      section: 'home',
      fields: [
        ['greeting', 'Greeting before your name'],
        ['scrollLabel', 'Scroll link label'],
        ['eyebrow', 'Availability badge'],
        ['experienceNote', 'What clients can expect'],
        ['visualEyebrow', 'Hero card label'],
        ['visualTitle', 'Hero card heading'],
        ['visualDescription', 'Hero card description', true],
        ['description', 'Hero description', true],
        ['primaryAction', 'Primary button'],
        ['secondaryAction', 'Secondary button'],
        ['browseNote', 'Browse note'],
        ['browseLinkLabel', 'Browse link label'],
        ['projectsTitle', 'Featured projects heading'],
        ['projectsDescription', 'Featured projects description', true],
        ['servicesTitle', 'Services shown when no case studies are published'],
        ['servicesDescription', 'Services section introduction', true],
        ['viewAllServicesLabel', 'All services link'],
        ['projectsEmpty', 'Empty projects message', true],
        ['ctaTitle', 'Bottom call-to-action heading'],
        ['ctaDescription', 'Bottom call-to-action description', true],
        ['ctaPrimary', 'Bottom primary button'],
        ['ctaSecondary', 'Bottom secondary button'],
        ['viewAllProjectsLabel', 'View all projects link'],
      ],
    },
    {
      title: 'About page',
      section: 'about',
      fields: [
        ['title', 'Page heading'],
        ['whoTitle', 'First section heading'],
        ['whoDescription', 'First section text', true],
        ['whatTitle', 'Second section heading'],
        ['whatDescription', 'Second section text', true],
        ['howTitle', 'Third section heading'],
        ['howDescription', 'Third section text', true],
        ['skillsTitle', 'Skills heading'],
        ['ctaTitle', 'Bottom call-to-action heading'],
        ['ctaDescription', 'Bottom call-to-action description', true],
        ['ctaPrimary', 'Primary button'],
        ['ctaSecondary', 'Secondary button'],
      ],
    },
    {
      title: 'Projects page',
      section: 'projects',
      fields: [
        ['title', 'Page heading'],
        ['description', 'Page introduction', true],
        ['emptyTitle', 'Empty state heading'],
        ['emptyDescription', 'Empty state description', true],
        ['projectTypesTitle', 'Project types heading'],
        ['projectTypesDescription', 'Project types introduction', true],
        ['ctaTitle', 'Call-to-action heading'],
        ['ctaDescription', 'Call-to-action description', true],
        ['ctaButton', 'Call-to-action button'],
        ['demoLinkLabel', 'Project demo link'],
        ['sourceLinkLabel', 'Project source link'],
        ['detailsLabel', 'Project details label'],
      ],
    },
    {
      title: 'Services page',
      section: 'services',
      fields: [
        ['emptyMessage', 'Empty state message'],
        ['eyebrow', 'Eyebrow'],
        ['title', 'Page heading'],
        ['description', 'Page introduction', true],
        ['ctaTitle', 'Call-to-action heading'],
        ['ctaDescription', 'Call-to-action description', true],
        ['ctaButton', 'Call-to-action button'],
      ],
    },
    {
      title: 'Skills page',
      section: 'skills',
      fields: [
        ['additionalSkillsTitle', 'Additional skills heading'],
        ['eyebrow', 'Eyebrow'],
        ['title', 'Page heading'],
        ['description', 'Page introduction', true],
        ['ctaTitle', 'Call-to-action heading'],
        ['ctaDescription', 'Call-to-action description', true],
        ['ctaButton', 'Call-to-action button'],
      ],
    },
    {
      title: 'Experience page & education',
      section: 'experience',
      fields: [
        ['emptyMessage', 'Empty state message'],
        ['eyebrow', 'Eyebrow'],
        ['title', 'Page heading'],
        ['description', 'Page introduction', true],
        ['educationTitle', 'Education heading'],
        ['educationDegree', 'Degree'],
        ['educationField', 'Field of study'],
        ['educationResult', 'Result'],
        ['educationDescription', 'Education description', true],
        ['ctaTitle', 'Call-to-action heading'],
        ['ctaDescription', 'Call-to-action description', true],
        ['ctaButton', 'Call-to-action button'],
      ],
    },
    {
      title: 'Contact page',
      section: 'contact',
      fields: [
        ['namePlaceholder', 'Name placeholder'],
        ['emailPlaceholder', 'Email placeholder'],
        ['subjectPlaceholder', 'Subject placeholder'],
        ['messagePlaceholder', 'Message placeholder'],
        ['nextStepTitle', 'Next steps heading'],
        ['nextStep1', 'Next step one'],
        ['nextStep2', 'Next step two'],
        ['nextStep3', 'Next step three'],
        ['projectBriefHint', 'Project brief helper text'],
        ['projectTypeLabel', 'Project type label'],
        ['projectTypePlaceholder', 'Project type placeholder'],
        ['businessWebsiteOption', 'Business website option'],
        ['webApplicationOption', 'Web application option'],
        ['mobileApplicationOption', 'Mobile application option'],
        ['ecommerceOption', 'E-commerce option'],
        ['apiOption', 'API project option'],
        ['otherProjectOption', 'Other project option'],
        ['timelineLabel', 'Timeline field label'],
        ['timelinePlaceholder', 'Timeline placeholder'],
        ['title', 'Page heading'],
        ['description', 'Page introduction', true],
        ['formTitle', 'Contact form heading'],
        ['contactInfoTitle', 'Contact details heading'],
        ['emailInfoLabel', 'Email information label'],
        ['phoneInfoLabel', 'Phone information label'],
        ['locationInfoLabel', 'Location information label'],
        ['nameLabel', 'Name field label'],
        ['emailLabel', 'Email field label'],
        ['subjectLabel', 'Subject field label'],
        ['messageLabel', 'Message field label'],
        ['sendButton', 'Submit button'],
        ['sentButton', 'Submitted button text'],
        ['socialTitle', 'Social links heading'],
      ],
    },
    {
      title: 'Footer',
      section: 'footer',
      fields: [
        ['bio', 'Footer biography', true],
        ['navigationTitle', 'Navigation heading'],
        ['servicesTitle', 'Services heading'],
        ['contactTitle', 'Contact heading'],
        ['ctaButton', 'Contact button'],
        ['copyrightName', 'Copyright name'],
        ['craftNote', 'Footer note'],
        ['backToTopLabel', 'Back to top label'],
      ],
    },
  ];

  const renderContentField = (section, [field, label, multiline]) => {
    const value = siteForm.siteContent[section]?.[field] || '';
    const fieldClass =
      'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500';
    return (
      <label key={`${section}-${field}`} className="block text-xs font-medium text-slate-400">
        <span className="mb-1 block">{label}</span>
        {multiline ? (
          <textarea
            rows={3}
            className={fieldClass}
            value={value}
            onChange={(e) => updateSiteContentField(section, field, e.target.value)}
          />
        ) : (
          <input
            className={fieldClass}
            value={value}
            onChange={(e) => updateSiteContentField(section, field, e.target.value)}
          />
        )}
      </label>
    );
  };

  const collection = { projects, services, experience: experiences }[activeTab];
  const collectionTab = ['projects', 'services', 'experience'].includes(activeTab);
  const waiting = collectionTab ? !collection : !siteInfo;
  const loadError = collectionTab
    ? { projects: projectsError, services: servicesError, experience: experiencesError }[activeTab]
    : siteInfoError;
  const retry = collectionTab
    ? { projects: reloadprojects, services: reloadservices, experience: reloadexperiences }[activeTab]
    : reloadsiteInfo;

  return (
    <>
      <Head>
        <title>Portfolio admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <main className="min-h-screen pt-10 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-50">
                Portfolio admin
              </h1>
              <p className="text-sm text-slate-400 mt-1">Edit and publish your portfolio</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="text-sm font-medium text-blue-300 hover:underline">View website</Link>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/dashboard' })}
              className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm text-slate-300 transition hover:bg-rose-950/40 hover:text-rose-300 self-start sm:self-auto"
            >
              <FaSignOutAlt /> Sign out
            </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'content', label: 'Page content' },
              { id: 'appearance', label: 'Appearance' },
              { id: 'seo', label: 'SEO' },
              { id: 'skills', label: 'Skills' },
              { id: 'projects', label: 'Projects' },
              { id: 'services', label: 'Services' },
              { id: 'experience', label: 'Experience' },
            ].map((tab) => (
              <button
                key={tab.id}
                aria-pressed={activeTab === tab.id}
                onClick={() => { setActiveTab(tab.id); setNotice(null); }}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                    : 'bg-slate-900/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {notice && (
            <div role={notice.error ? 'alert' : 'status'} className="sticky top-3 z-10 mb-6 flex justify-between gap-4 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm">
              <p className={notice.error ? 'text-rose-300' : 'text-emerald-300'}>{notice.text}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button>
            </div>
          )}
          {loadError && (
            <div role="alert" className="mb-6 rounded-lg border border-rose-900 bg-rose-950/30 p-4 text-sm text-rose-200">
              Could not load saved content. <button type="button" className="underline" onClick={retry}>Retry</button>
            </div>
          )}
          {waiting && !loadError && <p role="status" className="text-sm text-slate-300">Loading saved content…</p>}

          {!waiting && (activeTab === 'appearance' || activeTab === 'seo') && (
            <SiteSettings tab={activeTab} siteForm={siteForm} update={updateSiteContentField}
              save={handleSaveProfile} saving={updateSiteInfo.isLoading} setNotice={setNotice} />
          )}

          {/* Profile and photo */}
          {!waiting && activeTab === 'profile' && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-sm max-w-4xl">
              <h2 className="text-xl font-bold text-slate-50 mb-6">Profile &amp; Biography Settings</h2>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Photo Upload & Preview */}
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                  <div className="relative">
                    <img
                      src={siteForm.avatarUrl || '/images/profile.png'}
                      alt="Avatar"
                      className="h-28 w-28 rounded-full border-2 border-blue-500/40 object-cover shadow-lg"
                      onError={(e) => {
                        e.target.src = 'https://ui-avatars.com/api/?name=Suraj+Gupta&size=300&background=1e40af&color=fff';
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Profile Photo / Avatar</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAvatarUpload}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-medium file:text-blue-400 hover:file:bg-slate-700 cursor-pointer"
                    />
                    {uploadingAvatar && <p className="text-xs text-blue-400 animate-pulse">Uploading photo...</p>}
                    <p className="text-xs text-slate-500">Or enter an image URL directly:</p>
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-100"
                      value={siteForm.avatarUrl}
                      onChange={(e) => setSiteForm({ ...siteForm, avatarUrl: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Full Name</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                      value={siteForm.name}
                      onChange={(e) => setSiteForm({ ...siteForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Tagline</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                      value={siteForm.tagline}
                      onChange={(e) => setSiteForm({ ...siteForm, tagline: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">About Biography</label>
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none resize-none"
                    value={siteForm.bio}
                    onChange={(e) => setSiteForm({ ...siteForm, bio: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Email</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                      value={siteForm.contactEmail}
                      onChange={(e) => setSiteForm({ ...siteForm, contactEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Phone</label>
                    <input
                      type="tel"
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                      value={siteForm.phone}
                      onChange={(e) => setSiteForm({ ...siteForm, phone: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-slate-400">Include your country code to enable the WhatsApp button across the site.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Location</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                      value={siteForm.location}
                      onChange={(e) => setSiteForm({ ...siteForm, location: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    ['github', 'GitHub URL'],
                    ['linkedin', 'LinkedIn URL'],
                    ['twitter', 'Twitter URL'],
                  ].map(([key, label]) => (
                    <label key={key} className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                      <span className="mb-1 block">{label}</span>
                      <input
                        type="url"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={siteForm.socialLinks[key]}
                        onChange={(e) => updateSocialLink(key, e.target.value)}
                      />
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={uploadingAvatar || updateSiteInfo.isLoading}
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-blue-400"
                >
                  <FaSave /> Save Profile Changes
                </button>
              </form>
            </div>
          )}

          {/* Website content editor */}
          {!waiting && activeTab === 'content' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {contentGroups.map((group) => (
                <section key={group.section} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                  <h2 className="mb-5 text-xl font-bold text-slate-50">{group.title}</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.fields.map((field) => renderContentField(group.section, field))}
                  </div>
                  {group.section === 'footer' && (
                    <label className="mt-4 block text-xs font-medium text-slate-400">
                      <span className="mb-1 block">Footer service list (comma separated)</span>
                      <textarea
                        rows={2}
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={Array.isArray(siteForm.siteContent.footer.services) ? siteForm.siteContent.footer.services.join(', ') : siteForm.siteContent.footer.services}
                        onChange={(e) =>
                          updateSiteContentField(
                            'footer',
                            'services',
                            e.target.value
                          )
                        }
                      />
                    </label>
                  )}
                  {group.section === 'navigation' && (
                    <p className="mt-4 text-xs text-slate-500">
                      Navigation labels can be changed here; page destinations are fixed to the existing site pages.
                    </p>
                  )}
                </section>
              ))}

              <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                <h2 className="mb-2 text-xl font-bold text-slate-50">Technology marquee</h2>
                <p className="mb-4 text-sm text-slate-400">Edit the scrolling technology names shown on the home and skills pages.</p>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                  value={Array.isArray(siteForm.siteContent.marqueeSkills) ? siteForm.siteContent.marqueeSkills.join(', ') : siteForm.siteContent.marqueeSkills}
                  onChange={(e) =>
                    setSiteForm((current) => ({
                      ...current,
                      siteContent: {
                        ...current.siteContent,
                        marqueeSkills: e.target.value,
                      },
                    }))
                  }
                />
              </section>

              <button
                type="submit"
                disabled={updateSiteInfo.isLoading}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500"
              >
                <FaSave /> Save Website Content
              </button>
            </form>
          )}

          {/* TAB 2: Skills Management */}
          {!waiting && activeTab === 'skills' && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 max-w-4xl">
              <h2 className="text-xl font-bold text-slate-50 mb-2">Portfolio Skills</h2>
              <p className="text-sm text-slate-400 mb-6">Manage the profile skills displayed on the About page and in the skills database list.</p>

              {/* Add Skill Form */}
              <form onSubmit={handleAddSkill} className="flex gap-3 mb-8">
                <input
                  type="text"
                  placeholder="e.g. Next.js, Redis, Docker, Tailwind CSS..."
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 focus:border-blue-500 outline-none"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500 transition"
                >
                  <FaPlus /> Add Skill
                </button>
              </form>

              {/* Current Skills list with Delete buttons */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-6 mb-6">
                <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-4">
                  Active Skills List ({siteForm.skills?.length || 0}) — Click the × to delete
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {siteForm.skills && siteForm.skills.length > 0 ? (
                    siteForm.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="group inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3.5 py-1.5 text-sm font-medium text-slate-200 transition hover:border-rose-500/50 hover:bg-rose-950/20"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleDeleteSkill(skill)}
                          className="text-slate-400 hover:text-rose-400 transition"
                          title="Delete skill"
                        >
                          &times;
                        </button>
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No skills added yet.</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-500 transition"
              >
                <FaSave /> Save Skills to Database
              </button>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-50">Skills page categories</h2>
                    <p className="mt-1 text-sm text-slate-400">Edit the grouped skills shown on the Skills page.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteForm((current) => ({
                        ...current,
                        skillCategories: [...current.skillCategories, { category: '', icon: 'FaTools', skills: [] }],
                      }))
                    }
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                  >
                    <FaPlus /> Add Category
                  </button>
                </div>
                <div className="space-y-4">
                  {siteForm.skillCategories.map((category, index) => (
                    <div key={`${category.category}-${index}`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
                        <input
                          aria-label="Skill category title"
                          className="rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                          value={category.category}
                          onChange={(e) => updateSkillCategory(index, 'category', e.target.value)}
                          placeholder="Category title"
                        />
                        <select
                          aria-label="Skill category icon"
                          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
                          value={category.icon}
                          onChange={(e) => updateSkillCategory(index, 'icon', e.target.value)}
                        >
                          {['FaReact', 'FaNodeJs', 'FaPhp', 'FaPython', 'FaDatabase', 'FaTools'].map((icon) => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            setSiteForm((current) => ({
                              ...current,
                              skillCategories: current.skillCategories.filter((_, categoryIndex) => categoryIndex !== index),
                            }))
                          }
                          className="rounded-lg border border-rose-900/60 px-3 py-2 text-rose-300 hover:bg-rose-950/40"
                          aria-label="Delete category"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <textarea
                        aria-label="Category skills"
                        rows={2}
                        className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-100"
                        value={category.skills.join(', ')}
                        onChange={(e) =>
                          updateSkillCategory(
                            index,
                            'skills',
                            e.target.value.split(',').map((skill) => skill.trim()).filter(Boolean)
                          )
                        }
                        placeholder="Comma-separated skills"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={updateSiteInfo.isLoading}
                  className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-blue-500"
                >
                  <FaSave /> Save All Skills
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Projects Manager */}
          {!waiting && activeTab === 'projects' && (
            <div className="space-y-12">
              {/* Add Project Form */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 max-w-4xl">
                <h2 className="text-xl font-bold text-slate-50 mb-6">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingProject) updateProject.mutate({ _id: editingProject, ...projForm });
                    else addProject.mutate(projForm);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Title</label>
                    <input
                      required
                      placeholder="e.g. Tuition SaaS Platform"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={projForm.title}
                      onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Project architecture and features..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                      value={projForm.description}
                      onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Tech Stack (comma separated)</label>
                    <input
                      placeholder="Next.js, TypeScript, Tailwind, MongoDB"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={projForm.techStack.join(', ')}
                      onChange={(e) =>
                        setProjForm({
                          ...projForm,
                          techStack: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Live Demo URL</label>
                      <input
                        placeholder="https://..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={projForm.demoUrl}
                        onChange={(e) => setProjForm({ ...projForm, demoUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Repo URL</label>
                      <input
                        placeholder="https://github.com/..."
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={projForm.repoUrl}
                        onChange={(e) => setProjForm({ ...projForm, repoUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Screenshot upload */}
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Project Screenshot</label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleProjImageUpload}
                      className="block w-full text-xs text-slate-400 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-4 file:py-2 file:text-xs file:font-medium file:text-blue-400 hover:file:bg-slate-700"
                    />
                    {uploadingProjImg && <p className="text-xs text-blue-400 animate-pulse mt-1">Uploading...</p>}
                    <input
                      type="text"
                      placeholder="Or paste image URL (Unsplash, etc.)"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-1.5 text-xs text-slate-100"
                      value={projForm.imageUrl}
                      onChange={(e) => setProjForm({ ...projForm, imageUrl: e.target.value })}
                    />
                      <label className="mt-3 block text-sm text-slate-300">Image alternative text
                        <input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-2.5" value={projForm.imageAlt || ''}
                          onChange={(event) => setProjForm({ ...projForm, imageAlt: event.target.value })} />
                      </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingProjImg || addProject.isLoading || updateProject.isLoading}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500"
                  >
                    {editingProject ? <FaSave /> : <FaPlus />} {editingProject ? 'Save Project' : 'Add Project'}
                  </button>
                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setProjForm({ title: '', description: '', techStack: [], demoUrl: '', repoUrl: '', imageUrl: '' });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <FaTimes /> Cancel edit
                    </button>
                  )}
                </form>
              </div>

              {/* Published Projects List & Delete */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-50 mb-6">Published Projects ({projects?.length || 0})</h3>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {projects?.map((p) => (
                    <div key={p._id} className="relative rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden flex flex-col justify-between">
                      {p.imageUrl && (
                        <div className="h-40 overflow-hidden bg-slate-900 border-b border-slate-800">
                          <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-100">{p.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{p.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {p.techStack?.map((t, i) => (
                              <span key={i} className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-[10px] text-slate-500">ID: {p._id.slice(-6)}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProject(p._id);
                                setProjForm({
                                  title: p.title || '',
                                  description: p.description || '',
                                  techStack: p.techStack || [],
                                  demoUrl: p.demoUrl || '',
                                  repoUrl: p.repoUrl || '',
                                  imageUrl: p.imageUrl || '', imageAlt: p.imageAlt || '',
                                });
                              }}
                              className="flex items-center gap-1 rounded border border-blue-900/60 px-2.5 py-1 text-xs text-blue-300 hover:bg-blue-950/40"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete project "${p.title}"?`)) {
                                  deleteProject.mutate(p._id);
                                }
                              }}
                              className="flex items-center gap-1 rounded bg-rose-950/50 border border-rose-900/60 px-2.5 py-1 text-xs text-rose-300 hover:bg-rose-900 transition"
                            >
                              <FaTrash className="h-3 w-3" /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Services */}
          {!waiting && activeTab === 'services' && (
            <div className="space-y-12">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 max-w-4xl">
                <h2 className="text-xl font-bold text-slate-50 mb-6">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const payload = {
                      title: serviceForm.title,
                      description: serviceForm.description,
                      icon: serviceForm.icon,
                      features: serviceForm.featuresString.split(',').map((s) => s.trim()).filter(Boolean),
                    };
                    if (editingService) updateService.mutate({ _id: editingService, ...payload });
                    else addService.mutate(payload);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Service Title</label>
                    <input
                      required
                      placeholder="e.g. MERN Stack Web Applications"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={serviceForm.title}
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Details of the service..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Icon Key</label>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={serviceForm.icon}
                      onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                    >
                      <option value="FaCode">FaCode (Frontend / Coding)</option>
                      <option value="FaServer">FaServer (Backend / Servers)</option>
                      <option value="FaDatabase">FaDatabase (Database / Python)</option>
                      <option value="FaCloud">FaCloud (APIs / Cloud)</option>
                      <option value="FaRocket">FaRocket (Optimization / Speed)</option>
                      <option value="FaMobileAlt">FaMobileAlt (Mobile / UI)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Feature Bullet Points (comma separated)</label>
                    <input
                      placeholder="Feature 1, Feature 2, Feature 3"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={serviceForm.featuresString}
                      onChange={(e) => setServiceForm({ ...serviceForm, featuresString: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addService.isLoading || updateService.isLoading}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {editingService ? <FaSave /> : <FaPlus />} {editingService ? 'Save Service' : 'Add Service'}
                  </button>
                  {editingService && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingService(null);
                        setServiceForm({ title: '', description: '', icon: 'FaCode', featuresString: '' });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <FaTimes /> Cancel edit
                    </button>
                  )}
                </form>
              </div>

              {/* Services List */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-50 mb-6">Active Services ({services?.length || 0})</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {services?.map((s) => (
                    <div key={s._id} className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                      <div>
                        <h4 className="font-semibold text-slate-100">{s.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                      </div>
                      <div className="ml-3 flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            setEditingService(s._id);
                            setServiceForm({
                              title: s.title || '',
                              description: s.description || '',
                              icon: s.icon || 'FaCode',
                              featuresString: (s.features || []).join(', '),
                            });
                          }}
                          className="rounded-lg border border-blue-900/60 p-2 text-blue-300 hover:bg-blue-950/40"
                          aria-label={`Edit ${s.title}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete service "${s.title}"?`)) deleteService.mutate(s._id);
                          }}
                          className="rounded-lg border border-rose-900/60 p-2 text-rose-300 hover:bg-rose-950/40"
                          aria-label={`Delete ${s.title}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Experience */}
          {!waiting && activeTab === 'experience' && (
            <div className="space-y-12">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 max-w-4xl">
                <h2 className="text-xl font-bold text-slate-50 mb-6">{editingExperience ? 'Edit Experience' : 'Add Experience Entry'}</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const payload = {
                      role: expForm.role,
                      company: expForm.company,
                      location: expForm.location,
                      period: expForm.period,
                      description: expForm.description,
                      technologies: expForm.techString.split(',').map((s) => s.trim()).filter(Boolean),
                    };
                    if (editingExperience) updateExperience.mutate({ _id: editingExperience, ...payload });
                    else addExperience.mutate(payload);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Role Title</label>
                      <input
                        required
                        placeholder="e.g. Senior Full-Stack Engineer"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={expForm.role}
                        onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Company</label>
                      <input
                        required
                        placeholder="Company, client, or project name"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={expForm.company}
                        onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Time Period</label>
                      <input
                        placeholder="e.g. 2022 - Present"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={expForm.period}
                        onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Location</label>
                      <input
                        placeholder="e.g. Lucknow, India (Remote)"
                        className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                        value={expForm.location}
                        onChange={(e) => setExpForm({ ...expForm, location: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Achievements and responsibilities..."
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500 resize-none"
                      value={expForm.description}
                      onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Technologies Used (comma separated)</label>
                    <input
                      placeholder="Next.js, Node.js, MongoDB, Docker"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-500"
                      value={expForm.techString}
                      onChange={(e) => setExpForm({ ...expForm, techString: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addExperience.isLoading || updateExperience.isLoading}
                    className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 transition disabled:opacity-50"
                  >
                    {editingExperience ? <FaSave /> : <FaPlus />} {editingExperience ? 'Save Experience' : 'Add Career Milestone'}
                  </button>
                  {editingExperience && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingExperience(null);
                        setExpForm({ role: '', company: '', location: '', period: '', description: '', techString: '' });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800"
                    >
                      <FaTimes /> Cancel edit
                    </button>
                  )}
                </form>
              </div>

              {/* Experience List */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-slate-50 mb-6">Career Timeline ({experiences?.length || 0})</h3>
                <div className="space-y-3">
                  {experiences?.map((exp) => (
                    <div key={exp._id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60">
                      <div>
                        <h4 className="font-semibold text-slate-100">{exp.role} <span className="text-blue-400 font-normal">at {exp.company}</span></h4>
                        <p className="text-xs text-slate-400">{exp.period} • {exp.location}</p>
                      </div>
                      <div className="ml-3 flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            setEditingExperience(exp._id);
                            setExpForm({
                              role: exp.role || '',
                              company: exp.company || '',
                              location: exp.location || '',
                              period: exp.period || '',
                              description: exp.description || '',
                              techString: (exp.technologies || []).join(', '),
                            });
                          }}
                          className="rounded-lg border border-blue-900/60 p-2 text-blue-300 hover:bg-blue-950/40"
                          aria-label={`Edit experience at ${exp.company}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete experience at "${exp.company}"?`)) deleteExperience.mutate(exp._id);
                          }}
                          className="rounded-lg border border-rose-900/60 p-2 text-rose-300 hover:bg-rose-950/40"
                          aria-label={`Delete experience at ${exp.company}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

    </>
  );
}

Dashboard.adminPage = true;

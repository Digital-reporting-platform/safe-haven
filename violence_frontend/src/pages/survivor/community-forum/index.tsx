import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  MoreHorizontal,
  Search,
  Image as ImageIcon,
  Smile,
  ShieldCheck,
  Filter,
  Sparkles,
  Zap,
  Flame,
  Droplets,
  Plus,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  ForumCategory,
  FORUM_CATEGORY_LABELS,
  FORUM_CATEGORY_ICONS,
  FORUM_CATEGORY_COLORS,
  ForumPost,
  ForumPostStatus,
  getAllForumCategories,
  formatTimeAgo,
} from '@/types/forum';

// --- Mock Data ---

const TOPIC_CATEGORIES = getAllForumCategories().map((category) => ({
  id: category,
  label: FORUM_CATEGORY_LABELS[category],
  icon: FORUM_CATEGORY_ICONS[category],
  ...FORUM_CATEGORY_COLORS[category],
}));

const MOCK_THREADS: Partial<ForumPost>[] = [];

const MOCK_REPLIES: Record<string, any[]> = {};

export function CommunityForumPage() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ForumCategory | 'ALL'>(
    'ALL'
  );
  const [isPosting, setIsPosting] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Partial<ForumPost> | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [replyContent, setReplyContent] = useState('');
  const [postError, setPostError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Filter threads
  const filteredThreads =
    activeCategory === 'ALL'
      ? MOCK_THREADS
      : MOCK_THREADS.filter((t) => t.category === activeCategory);

  // Handle post selection
  const handlePostSelect = (post: Partial<ForumPost>) => {
    setSelectedPost(post);
  };

  // Handle like toggle
  const handleLikeToggle = (postId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  // Handle reply submission
  const handleReplySubmit = () => {
    const trimmed = replyContent.trim();
    if (trimmed.length < 5) {
      setReplyError(t('survivor.communityForum.replyTooShort'));
      return;
    }
    if (trimmed.length > 300) {
      setReplyError(t('survivor.communityForum.replyTooLong'));
      return;
    }

    if (selectedPost?.id) {
      // In a real app, this would make an API call
      console.log('Reply submitted:', replyContent);
      setReplyContent('');
      setReplyError(null);
    }
  };

  const handlePostSubmit = () => {
    const trimmed = postContent.trim();
    if (trimmed.length < 10) {
      setPostError(t('survivor.communityForum.postTooShort'));
      return;
    }
    if (trimmed.length > 500) {
      setPostError(t('survivor.communityForum.postTooLong'));
      return;
    }

    console.log('Post submitted:', postContent);
    setPostContent('');
    setIsPosting(false);
    setPostError(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#C15B3E] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-stone-800">
                  {t('survivor.communityForum.title')}
                </h1>
                <p className="text-sm text-stone-500">
                  {t('survivor.communityForum.safeSpace')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-800"
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('survivor.communityForum.filter')}
              </Button>
              <Button
                onClick={() => setIsPosting(true)}
                size="sm"
                className="bg-[#C15B3E] hover:bg-[#A84D33] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('survivor.communityForum.newPost')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-stone-200 p-4 sticky top-24">
              <h3 className="text-sm font-semibold text-stone-800 mb-3 uppercase tracking-wide">
                {t('survivor.communityForum.categories')}
              </h3>
              <div className="space-y-0.5">
                <button
                  onClick={() => setActiveCategory('ALL')}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === 'ALL'
                      ? 'bg-[#C15B3E]/10 text-[#C15B3E]'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                  }`}
                >
                  <Filter className="w-4 h-4 inline mr-2 opacity-70" />
                  {t('survivor.communityForum.allTopics')}
                </button>
                {TOPIC_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as ForumCategory)}
                    className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-[#C15B3E]/10 text-[#C15B3E]'
                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                    }`}
                  >
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[#C15B3E] flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">You</span>
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder={t('survivor.communityForum.postPlaceholder')}
                    className="w-full resize-none border-none bg-transparent py-2 text-[15px] placeholder:text-stone-400 focus:ring-0 min-h-[60px]"
                    rows={2}
                    value={postContent}
                    onChange={(e) => {
                      setPostContent(e.target.value);
                      if (postError) setPostError(null);
                    }}
                    onFocus={() => setIsPosting(true)}
                  />
                  {postError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle size={12} /> {postError}
                    </p>
                  )}
                  {isPosting && (
                    <>
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100">
                        <button title="Add photo" className="p-2 rounded-md hover:bg-stone-100 text-stone-500 hover:text-[#C15B3E] transition-colors">
                          <ImageIcon className="h-5 w-5" />
                        </button>
                        <button title="Add mood" className="p-2 rounded-md hover:bg-stone-100 text-stone-500 hover:text-[#DDA15E] transition-colors">
                          <Smile className="h-5 w-5" />
                        </button>
                        <div className="flex-1"></div>
                        <span className={`text-xs ${postContent.length > 500 ? 'text-red-600' : 'text-stone-400'}`}>
                          {postContent.length}/500
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setIsPosting(false); setPostContent(''); }}
                          className="text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                        >
                          {t('survivor.communityForum.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          disabled={!postContent.trim()}
                          onClick={handlePostSubmit}
                          className="bg-[#C15B3E] hover:bg-[#A84D33] text-white disabled:opacity-40"
                        >
                          {t('survivor.communityForum.post')}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Feed Posts */}
            <div className="space-y-4 mt-6">
              {filteredThreads.length === 0 ? (
                <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-stone-400" />
                  </div>
                  <h3 className="font-semibold text-stone-800 mb-1">{t('survivor.communityForum.noPostsYet')}</h3>
                  <p className="text-stone-500 text-sm">
                    {t('survivor.communityForum.beFirstToPost')}
                  </p>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const category = TOPIC_CATEGORIES.find(
                    (c) => c.id === thread.category
                  );
                  return (
                    <article
                      key={thread.id}
                      className="bg-white rounded-lg border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handlePostSelect(thread)}
                    >
                      {/* Post Header */}
                      <div className="flex items-start justify-between p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                            thread.isAnonymous
                              ? 'bg-stone-100 text-stone-400'
                              : 'bg-[#C15B3E] text-white'
                          }`}>
                            {thread.isAnonymous ? (
                              <ShieldCheck className="w-5 h-5" />
                            ) : (
                              thread.author?.firstName?.substring(0, 1)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-800">
                                {thread.isAnonymous ? t('survivor.communityForum.anonymous') : thread.author?.firstName}
                              </span>
                              {thread.isAnonymous && (
                                <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded font-medium">
                                  {t('survivor.communityForum.protected')}
                                </span>
                              )}
                              <span className="text-stone-300">·</span>
                              <span className="text-stone-500">{category?.label}</span>
                            </div>
                            <p className="text-sm text-stone-400">{formatTimeAgo(thread.createdAt as string)}</p>
                          </div>
                        </div>
                        <button title={t('survivor.communityForum.more')} className="p-2 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Post Content */}
                      <div className="px-4 pb-3">
                        <h3 className="text-lg font-semibold text-stone-800 mb-2 leading-snug">
                          {thread.title}
                        </h3>
                        <p className="text-[15px] text-stone-600 leading-relaxed line-clamp-3">
                          {thread.content}
                        </p>
                      </div>

                      {/* Engagement Bar */}
                      <div className="flex items-center gap-1 px-4 py-3 border-t border-stone-100">
                        <button
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${likedPosts.has(thread.id as string) ? 'text-red-600 bg-red-50' : 'text-stone-500 hover:text-red-600 hover:bg-red-50'}`}
                          onClick={(e) => { e.stopPropagation(); handleLikeToggle(thread.id as string); }}
                        >
                          <Heart className={`w-4 h-4 ${likedPosts.has(thread.id as string) ? 'fill-current' : ''}`} />
                          <span>{(thread.likes || 0) + (likedPosts.has(thread.id as string) ? 1 : 0)}</span>
                        </button>
                        <button
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-stone-500 hover:text-[#C15B3E] hover:bg-[#C15B3E]/5 transition-colors"
                          onClick={(e) => { e.stopPropagation(); handlePostSelect(thread); }}
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{thread.commentCount}</span>
                        </button>
                        <button title={t('survivor.communityForum.share')} className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <div className="flex-1"></div>
                        <span className="text-sm text-stone-400">
                          {(thread.views || 0).toLocaleString()} {t('survivor.communityForum.views')}
                        </span>
                      </div>
                    </article>
                  );
                })
              )}

              {/* Load More */}
              <div className="text-center py-6">
                <Button
                  variant="outline"
                  className="border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                >
                  {t('survivor.communityForum.loadMorePosts')}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Post Details */}
          <div className="lg:col-span-2">
            {selectedPost ? (
              <div className="bg-white rounded-lg border border-stone-200 sticky top-24">
                {/* Selected Post Header */}
                <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-stone-800">{t('survivor.communityForum.postDetails')}</h3>
                    <button
                      onClick={() => setSelectedPost(null)}
                      className="p-1.5 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Selected Post Content */}
                <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {/* Main Post */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                      selectedPost.isAnonymous
                        ? 'bg-stone-100 text-stone-400'
                        : 'bg-[#C15B3E] text-white'
                    }`}>
                      {selectedPost.isAnonymous ? (
                        <ShieldCheck className="w-5 h-5" />
                      ) : (
                        selectedPost.author?.firstName?.substring(0, 1)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-stone-800">
                          {selectedPost.isAnonymous ? t('survivor.communityForum.anonymous') : selectedPost.author?.firstName}
                        </span>
                        {selectedPost.isAnonymous && (
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded font-medium">
                            {t('survivor.communityForum.protected')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-stone-400 mb-2">
                        {formatTimeAgo(selectedPost.createdAt as string)}
                      </div>
                      <h4 className="font-semibold text-stone-800 text-lg mb-2 leading-snug">{selectedPost.title}</h4>
                      <p className="text-[15px] text-stone-600 leading-relaxed">{selectedPost.content}</p>

                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 mt-4 text-sm text-stone-400">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {selectedPost.likes} {t('survivor.communityForum.likes')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" /> {selectedPost.commentCount} {t('survivor.communityForum.replies')}
                        </span>
                        <span>{(selectedPost.views || 0).toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="border-t border-stone-200 pt-4 mt-4">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#C15B3E] flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-semibold">You</span>
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder={t('survivor.communityForum.replyPlaceholder')}
                          className="w-full resize-none border border-stone-200 rounded-lg bg-white py-2 px-3 text-sm placeholder:text-stone-400 focus:ring-2 focus:ring-[#C15B3E] focus:border-transparent min-h-[80px]"
                          rows={2}
                          value={replyContent}
                          onChange={(e) => {
                            setReplyContent(e.target.value);
                            if (replyError) setReplyError(null);
                          }}
                        />
                        {replyError && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                            <AlertCircle size={12} /> {replyError}
                          </p>
                        )}
                        <div className="flex justify-end mt-2 gap-2">
                          <button
                            title="Add emoji"
                            className="p-2 rounded hover:bg-stone-100 text-[#DDA15E] transition-colors"
                          >
                            <Smile className="w-5 h-5" />
                          </button>
                          <Button
                            size="sm"
                            onClick={handleReplySubmit}
                            disabled={!replyContent.trim()}
                            className="bg-[#C15B3E] hover:bg-[#A84D33] text-white disabled:opacity-50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            {t('survivor.communityForum.reply')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Replies Thread */}
                  <div className="border-t border-stone-200 pt-4 mt-4">
                    <h4 className="font-semibold text-stone-800 text-sm mb-3">
                      {t('survivor.communityForum.replies')} ({MOCK_REPLIES[selectedPost.id as keyof typeof MOCK_REPLIES]?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {MOCK_REPLIES[selectedPost.id as keyof typeof MOCK_REPLIES]?.map((reply) => (
                        <div key={reply.id} className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 text-stone-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-stone-800 text-sm">
                                {reply.isAnonymous ? t('survivor.communityForum.anonymous') : reply.author?.firstName}
                              </span>
                              <span className="text-xs text-stone-400">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-stone-600 leading-relaxed">{reply.content}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button className="flex items-center gap-1 text-xs text-stone-400 hover:text-red-600 transition-colors">
                                <Heart className="w-3.5 h-3.5" />
                                <span>{reply.likes}</span>
                              </button>
                              <button className="text-xs text-stone-400 hover:text-[#C15B3E] transition-colors">
                                {t('survivor.communityForum.reply')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-stone-200 p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-stone-400" />
                </div>
                <h3 className="font-semibold text-stone-800 mb-1">{t('survivor.communityForum.selectPost')}</h3>
                <p className="text-stone-500 text-sm">
                  {t('survivor.communityForum.selectPostDesc')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guidelines Modal */}
      {showGuidelines && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#C15B3E] rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">
                {t('survivor.communityForum.communityGuidelines')}
              </h3>
              <p className="text-stone-500 text-sm">
                {t('survivor.communityForum.guidelinesDesc')}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: '💜', text: t('survivor.communityForum.guideline1'), desc: t('survivor.communityForum.guideline1Desc') },
                { icon: '🛡️', text: t('survivor.communityForum.guideline2'), desc: t('survivor.communityForum.guideline2Desc') },
                { icon: '🛑', text: t('survivor.communityForum.guideline3'), desc: t('survivor.communityForum.guideline3Desc') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="font-medium text-stone-800 text-sm">{item.text}</h4>
                    <p className="text-stone-500 text-xs">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-stone-200 text-stone-600 hover:bg-stone-50"
                onClick={() => navigate(-1)}
              >
                {t('survivor.communityForum.leave')}
              </Button>
              <Button
                className="flex-1 bg-[#C15B3E] hover:bg-[#A84D33] text-white"
                onClick={() => setShowGuidelines(false)}
              >
                {t('survivor.communityForum.iAgree')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

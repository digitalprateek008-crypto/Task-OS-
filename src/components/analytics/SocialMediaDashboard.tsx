import React, { useState } from 'react';
import {
  Instagram,
  Facebook,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  TrendingUp,
  Calendar,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { SocialContentMetric } from '../../types/database';
import { dataService } from '../../services/dataService';
import { formatCompactNumber, formatPercent } from '../../types/analytics';

interface SocialMediaDashboardProps {
  clientId: string;
  onOpenConnectSocial?: () => void;
}

export const SocialMediaDashboard: React.FC<SocialMediaDashboardProps> = ({
  clientId,
  onOpenConnectSocial,
}) => {
  const [platform, setPlatform] = useState<'all' | 'instagram' | 'facebook'>('instagram');

  const socialMetrics = dataService.getSocialMetrics(
    clientId,
    platform === 'all' ? undefined : platform
  );

  const totalFollowers = 0; // live or fetched
  const totalReach = socialMetrics.reduce((sum, s) => sum + s.reach, 0);
  const totalLikes = socialMetrics.reduce((sum, s) => sum + s.likes, 0);
  const totalComments = socialMetrics.reduce((sum, s) => sum + s.comments, 0);
  const totalShares = socialMetrics.reduce((sum, s) => sum + s.shares, 0);
  const totalInteractions = totalLikes + totalComments + totalShares;
  const avgEngagementRate =
    totalReach > 0 ? (totalInteractions / totalReach) * 100 : 0;

  return (
    <div className="space-y-5">
      {/* Platform Switcher */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg p-0.5">
          <button
            onClick={() => setPlatform('instagram')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
              platform === 'instagram' ? 'bg-[#0B1F3A] text-white' : 'text-[#667085]'
            }`}
          >
            <Instagram size={13} />
            <span>Instagram Professional</span>
          </button>
          <button
            onClick={() => setPlatform('facebook')}
            className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 ${
              platform === 'facebook' ? 'bg-[#0B1F3A] text-white' : 'text-[#667085]'
            }`}
          >
            <Facebook size={13} />
            <span>Facebook Pages</span>
          </button>
        </div>

        <button
          onClick={onOpenConnectSocial}
          className="h-8 px-3 rounded-lg bg-[#0B1F3A] text-white text-xs font-semibold hover:bg-[#18345C] flex items-center gap-1"
        >
          <Plus size={14} className="text-[#9DD52C]" />
          <span>Connect Social Channel</span>
        </button>
      </div>

      {socialMetrics.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-[#E5E7EB] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EFF3FF] text-[#0B1F3A] flex items-center justify-center mx-auto">
            {platform === 'instagram' ? <Instagram size={28} /> : <Facebook size={28} />}
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-[#0B1F3A]">
              No {platform === 'instagram' ? 'Instagram' : 'Facebook'} Account Connected
            </h3>
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
              Connect this client's {platform === 'instagram' ? 'Instagram Professional' : 'Facebook Page'} account using official Meta OAuth with <code className="font-mono text-[#0B1F3A]">instagram_manage_insights</code> and <code className="font-mono text-[#0B1F3A]">pages_show_list</code> permissions.
            </p>
          </div>
          <button
            onClick={onOpenConnectSocial}
            className="h-9 px-4 rounded-xl bg-[#0B1F3A] text-white text-xs font-bold hover:bg-[#18345C] transition-all"
          >
            Authorize Social Media Permissions
          </button>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Total Reach
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCompactNumber(totalReach)}
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Total Likes
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCompactNumber(totalLikes)}
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Comments & Shares
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatCompactNumber(totalComments + totalShares)}
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-xl border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(11,31,58,0.04)]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
                Engagement Rate
              </span>
              <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1 font-mono">
                {formatPercent(avgEngagementRate)}
              </p>
            </div>
          </div>

          {/* Content Posts Feed */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-4">
            <h4 className="text-xs font-bold text-[#0B1F3A]">Published Content Performance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {socialMetrics.map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-[#F7F8FA] rounded-xl border border-[#E5E7EB] space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#667085] mb-1">
                      <span className="capitalize font-semibold text-[#0B1F3A]">
                        {post.media_type}
                      </span>
                      <span className="font-mono">
                        {new Date(post.published_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#182230] line-clamp-2 leading-relaxed">
                      {post.caption}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-mono text-[#667085]">
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {formatCompactNumber(post.reach)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart size={12} className="text-rose-500" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> {post.comments}
                    </span>
                    <span className="font-bold text-[#486800]">
                      {formatPercent(post.engagement_rate || 0)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

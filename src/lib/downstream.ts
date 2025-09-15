/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { API_CONFIG, ApiSite, getConfig } from '@/lib/config';
import { SearchResult } from '@/lib/types';
import { cleanHtmlTags } from '@/lib/utils';

// 重构函数参数，使其更通用
interface SearchFromApiParams {
  site: ApiSite;
  query?: string;
  tid?: string; // 新增：用于按分类ID查询
  page?: number; // 新增：用于分页查询
}

// 重构返回值，使其能够返回 classes
interface DownstreamResult {
  success: boolean;
  list?: SearchResult[];
  classes?: any[];
  total?: number;
  message?: string;
}

const API_TIMEOUT = 8000;
const M3U8_PATTERN = /(https?:\/\/[^"'\s]+?\.m3u8)/g;

export async function searchFromApi(params: SearchFromApiParams): Promise<DownstreamResult> {
  const { site, query, tid, page = 1 } = params;
  
  let apiUrl = '';
  let classes: any[] = [];
  let list: SearchResult[] = [];
  let total = 0;
  
  // 根据不同的请求类型构建 URL
  if (site.type === 'maccms') {
    if (query) {
      // 搜索模式
      apiUrl = `${site.api_url}?ac=videolist&wd=${encodeURIComponent(query)}&pg=${page}`;
    } else if (tid) {
      // 按分类ID查询模式
      apiUrl = `${site.api_url}?ac=videolist&t=${tid}&pg=${page}`;
    } else {
      // 获取全部分类模式
      apiUrl = `${site.api_url}?ac=class`;
    }
  } else {
    // 处理其他类型的 API，这里只支持 maccms
    return { success: false, list: [], message: 'Unsupported API type.' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, message: `Request failed with status: ${response.status}` };
    }

    const data = await response.json();

    if (data.code !== 1) {
      return { success: false, message: data.msg || 'API returned an error code.' };
    }
    
    // 根据请求类型处理返回数据
    if (data.class && !query && !tid) {
      // 这是一个获取分类列表的请求
      classes = data.class;
    } else {
      // 这是一个获取影片列表的请求 (搜索或按分类)
      if (!data.list || !Array.isArray(data.list) || data.list.length === 0) {
        return { success: true, list: [], total: 0 };
      }

      list = data.list.map((item: any) => {
        let episodes: string[] = [];
        if (item.vod_play_url) {
          const m3u8Regex = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
          const vod_play_url_array = item.vod_play_url.split('$$$');
          vod_play_url_array.forEach((url: string) => {
            const matches = url.match(m3u8Regex) || [];
            if (matches.length > episodes.length) {
              episodes = matches;
            }
          });
        }
        episodes = Array.from(new Set(episodes)).map((link: string) => link.substring(1));
        
        return {
          id: item.vod_id.toString(),
          title: item.vod_name.trim().replace(/\s+/g, ' '),
          poster: item.vod_pic,
          episodes,
          source: site.key,
          source_name: site.name,
          class: item.vod_class,
          year: item.vod_year?.match(/\d{4}/)?.[0] || 'unknown',
          desc: cleanHtmlTags(item.vod_content || ''),
          type_name: item.type_name,
          douban_id: item.vod_douban_id,
        };
      });
      total = data.total;
    }

    return { success: true, list, classes, total };

  } catch (error: any) {
    console.error(`Error fetching data from ${site.name}:`, error);
    return { success: false, list: [], classes: [], message: error.message || 'Network or API error.' };
  }
}

// ----------------------------------------------------------------------------------
// 以下是您原始的 getDetailFromApi 函数，现在已重新添加到文件中
// ----------------------------------------------------------------------------------

export async function getDetailFromApi(
  apiSite: ApiSite,
  id: string
): Promise<SearchResult> {
  if (apiSite.detail) {
    return handleSpecialSourceDetail(id, apiSite);
  }

  const detailUrl = `${apiSite.api}${API_CONFIG.detail.path}${id}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(detailUrl, {
    headers: API_CONFIG.detail.headers,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`详情请求失败: ${response.status}`);
  }

  const data = await response.json();

  if (
    !data ||
    !data.list ||
    !Array.isArray(data.list) ||
    data.list.length === 0
  ) {
    throw new Error('获取到的详情内容无效');
  }

  const videoDetail = data.list[0];
  let episodes: string[] = [];

  if (videoDetail.vod_play_url) {
    const playSources = videoDetail.vod_play_url.split('$$$');
    if (playSources.length > 0) {
      const mainSource = playSources[0];
      const episodeList = mainSource.split('#');
      episodes = episodeList
        .map((ep: string) => {
          const parts = ep.split('$');
          return parts.length > 1 ? parts[1] : '';
        })
        .filter(
          (url: string) =>
            url && (url.startsWith('http://') || url.startsWith('https://'))
        );
    }
  }

  if (episodes.length === 0 && videoDetail.vod_content) {
    const matches = videoDetail.vod_content.match(M3U8_PATTERN) || [];
    episodes = matches.map((link: string) => link.replace(/^\$/, ''));
  }

  return {
    id: id.toString(),
    title: videoDetail.vod_name,
    poster: videoDetail.vod_pic,
    episodes,
    source: apiSite.key,
    source_name: apiSite.name,
    class: videoDetail.vod_class,
    year: videoDetail.vod_year
      ? videoDetail.vod_year.match(/\d{4}/)?.[0] || ''
      : 'unknown',
    desc: cleanHtmlTags(videoDetail.vod_content),
    type_name: videoDetail.type_name,
    douban_id: videoDetail.vod_douban_id,
  };
}

// ----------------------------------------------------------------------------------
// 以下是您原始的 handleSpecialSourceDetail 函数，也已重新添加
// ----------------------------------------------------------------------------------

async function handleSpecialSourceDetail(
  id: string,
  apiSite: ApiSite
): Promise<SearchResult> {
  const detailUrl = `${apiSite.detail}/index.php/vod/detail/id/${id}.html`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(detailUrl, {
    headers: API_CONFIG.detail.headers,
    signal: controller.signal,
  });

  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`详情页请求失败: ${response.status}`);
  }

  const html = await response.text();
  let matches: string[] = [];

  if (apiSite.key === 'ffzy') {
    const ffzyPattern =
      /\$(https?:\/\/[^"'\s]+?\/\d{8}\/\d+_[a-f0-9]+\/index\.m3u8)/g;
    matches = html.match(ffzyPattern) || [];
  }

  if (matches.length === 0) {
    const generalPattern = /\$(https?:\/\/[^"'\s]+?\.m3u8)/g;
    matches = html.match(generalPattern) || [];
  }

  matches = Array.from(new Set(matches)).map((link: string) => {
    link = link.substring(1); 
    const parenIndex = link.indexOf('(');
    return parenIndex > 0 ? link.substring(0, parenIndex) : link;
  });

  const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  const titleText = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(
    /<div[^>]*class=["']sketch["'][^>]*>([\s\S]*?)<\/div>/
  );
  const descText = descMatch ? cleanHtmlTags(descMatch[1]) : '';

  const coverMatch = html.match(/(https?:\/\/[^"'\s]+?\.jpg)/g);
  const coverUrl = coverMatch ? coverMatch[0].trim() : '';

  const yearMatch = html.match(/>(\d{4})</);
  const yearText = yearMatch ? yearMatch[1] : 'unknown';

  return {
    id,
    title: titleText,
    poster: coverUrl,
    episodes: matches,
    source: apiSite.key,
    source_name: apiSite.name,
    class: '',
    year: yearText,
    desc: descText,
    type_name: '',
    douban_id: 0,
  };
}

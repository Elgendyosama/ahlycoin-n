import axios from 'axios';

export interface NormalizedTeam {
  name: string;
  code: string;
  color: string;
  score: string | number;
}

export interface NormalizedMatch {
  id: string | number;
  tournament: string;
  status: 'انتهت' | 'مؤجلة' | 'مباشر' | string;
  homeTeam: NormalizedTeam;
  awayTeam: NormalizedTeam;
  startTimestamp?: number;
}

export class SportApi7Service {
  private static isRelevantEvent(event: any): boolean {
    if (!event) return false;

    const homeId = String(event.homeTeam?.id || '');
    const awayId = String(event.awayTeam?.id || '');
    const homeName = (event.homeTeam?.name || '') + ' ' + (event.homeTeam?.fieldTranslations?.nameTranslation?.ar || '');
    const awayName = (event.awayTeam?.name || '') + ' ' + (event.awayTeam?.fieldTranslations?.nameTranslation?.ar || '');

    // 1. Must involve Al Ahly FC (Team ID 6910 or Al Ahly in name)
    const isAhly =
      homeId === '6910' ||
      awayId === '6910' ||
      homeName.includes('Ahly') ||
      homeName.includes('الأهلي') ||
      awayName.includes('Ahly') ||
      awayName.includes('الأهلي');

    if (!isAhly) return false;

    // 2. Filter out unwanted/amateur competitions
    const tourName = (event.tournament?.name || '') + ' ' + (event.tournament?.fieldTranslations?.nameTranslation?.ar || '');

    if (tourName.includes('بطولة الهواة') || tourName.includes('Amateur')) {
      return false;
    }

    const isRelevantTournament =
      tourName.includes('Premier League') ||
      tourName.includes('الدوري المصري') ||
      tourName.includes('CAF') ||
      tourName.includes('أبطال أفريقيا') ||
      tourName.includes('League Cup') ||
      tourName.includes('كأس الرابطة') ||
      tourName.includes('Egypt Cup') ||
      tourName.includes('كأس مصر') ||
      tourName.includes('Super Cup') ||
      tourName.includes('السوبر') ||
      tourName.includes('World') ||
      tourName.includes('ودية');

    return isRelevantTournament;
  }

  private static parseEvent(event: any): NormalizedMatch {
    const tournamentName =
      event.tournament?.fieldTranslations?.nameTranslation?.ar ||
      event.tournament?.name ||
      'الدوري المصري الممتاز';

    let status = 'مباشر';
    if (event.status?.type === 'finished') {
      status = 'انتهت';
    } else if (event.status?.type === 'postponed') {
      status = 'مؤجلة';
    } else if (event.status?.type === 'notstarted' || event.status?.type === 'scheduled') {
      status = 'قادمة';
    }

    const homeTeamName =
      event.homeTeam?.fieldTranslations?.nameTranslation?.ar ||
      event.homeTeam?.name ||
      'الأهلي';

    const awayTeamName =
      event.awayTeam?.fieldTranslations?.nameTranslation?.ar ||
      event.awayTeam?.name ||
      'الخصم';

    return {
      id: event.id,
      tournament: tournamentName,
      status: status,
      homeTeam: {
        name: homeTeamName,
        code: event.homeTeam?.nameCode || 'AHL',
        color: event.homeTeam?.teamColors?.primary || '#cc0000',
        score: event.homeScore?.display ?? '-',
      },
      awayTeam: {
        name: awayTeamName,
        code: event.awayTeam?.nameCode || 'AWY',
        color: event.awayTeam?.teamColors?.primary || '#333333',
        score: event.awayScore?.display ?? '-',
      },
      startTimestamp: event.startTimestamp,
    };
  }

  public static async getMatches(): Promise<NormalizedMatch[]> {
    const apiKey =
      process.env.RAPIDAPI_KEY || '4a0133405dmshfd4e0fff991fd59p15a685jsn53d1ec15b2c5';
    const apiHost = process.env.RAPIDAPI_HOST || 'sportapi7.p.rapidapi.com';

    const headers = {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': apiHost,
    };

    try {
      const [lastResponse, nextResponse] = await Promise.all([
        axios.get(`https://${apiHost}/api/v1/team/6910/events/last/0`, {
          headers,
          timeout: 6000,
        }),
        axios.get(`https://${apiHost}/api/v1/team/6910/events/next/0`, {
          headers,
          timeout: 6000,
        }),
      ]);

      const lastEvents = lastResponse.data?.events || [];
      const nextEvents = nextResponse.data?.events || [];
      const combinedEvents = [...lastEvents, ...nextEvents];

      if (combinedEvents.length > 0) {
        const filtered = combinedEvents.filter((e: any) => this.isRelevantEvent(e));
        if (filtered.length > 0) {
          return filtered.map((e: any) => this.parseEvent(e));
        }
      }
    } catch (error: any) {
      console.error('Error fetching RapidAPI SportAPI7 matches:', error.message);
    }

    // Fallback data structure adhering strictly to the normalized schema if API fails
    return [
      {
        id: 14956406,
        tournament: 'كأس الدوري، المجموعة ا',
        status: 'انتهت',
        homeTeam: {
          name: 'الأهلي',
          code: 'AHL',
          color: '#cc0000',
          score: 1,
        },
        awayTeam: {
          name: 'طلائع الجيش',
          code: 'GAI',
          color: '#d80e12',
          score: 2,
        },
        startTimestamp: 1768489200,
      },
      {
        id: 16738943,
        tournament: 'الدوري المصري الممتاز',
        status: 'مباشر',
        homeTeam: {
          name: 'الأهلي',
          code: 'AHL',
          color: '#cc0000',
          score: 2,
        },
        awayTeam: {
          name: 'سموحة',
          code: 'SMO',
          color: '#020fc7',
          score: 1,
        },
        startTimestamp: 1788454800,
      },
      {
        id: 16738944,
        tournament: 'الدوري المصري الممتاز',
        status: 'قادمة',
        homeTeam: {
          name: 'الزمالك',
          code: 'ZAM',
          color: '#ffffff',
          score: '-',
        },
        awayTeam: {
          name: 'الأهلي',
          code: 'AHL',
          color: '#cc0000',
          score: '-',
        },
        startTimestamp: 1789000000,
      },
    ];
  }
}

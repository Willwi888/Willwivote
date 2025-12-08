import { Song } from './types';

// Helper to extract ID from drive link if needed, but we will hardcode the IDs for stability
// Based on the provided links in the prompt.
const rawLinks = [
  "1Li45a4NhWYbrsuNDEPUOLos_q_dXbFYb", "1vjTJvdzuSnsbSTo3lwo42hEJhkdRs90n", "1vS56CRaIhsMKAmiPe2J8rFUKnAVElxDT", "15UTVstZSuSKxmSorirZXhwN0-seE8h2g",
  "1Z6q6pezf5GLApHJAYS6DoVhrWNljr4Zz", "137rgVEGSg3cQ9jhCv5MnBd9OP9Gk5qx1", "1IVeh7-lZgTZYOXNt-9pDtoGssYPGhLCL", "1r2DJz_jPFak3Y0YtDAzL7OAyVGskh8ep",
  "1CmswAAdYje5tZ_ZQX7ybsskXqXHrJaZj", "1oXwOwk83toZQOwlrK31UJxeix_wKuTqz", "1GglGIAG6RpmrJbDfZnpX1p-7cVdT7wAJ", "1pHRPqGEMtGk2JZhL0iFOJRhosWjnzOtj",
  "17kMshKpdV5GZYk0MN1NDisN4f3ixxsxb", "17J2ya5Xa0D03JGPoovnka5ku0kJ3yr7s", "1VxPtLtkwoUMUUTDI1PDmqLy3RfMUOs-O", "1fVyyp_1MAyCpXNgPFv5uCXkQf_BDGyIb",
  "15lucHVebvepaB-cPsopkbhdz6Giy15-E", "1SqEEckRVdSKWHiCZnTepu51YR2omq57h", "1upjG_A2AcMAzbqxtwjMpC_VxPZY6VBfu", "1ZBId5gxH5K6eBW7Be0UykJiS07oXZ-fg",
  "1C6MvTo6J5tYY11BNcRWZWJE1F344SNBp", "1iKKJFCMJco6qousIMXPHq2PxHqkYu8mE", "1hgdu4pRvlkFuQeSOt0JDgklQuwymb-pe", "1mizb3ZrF1BVh7yOgkVINmn1l5DUqUQNx",
  "18J0xnJtqdb-dQ9J8ga33u-IR7L1ZAN9C", "1sl5NHhlbAvCYzUvP1pbeQMKpBhyCwprn", "1qZcrJ0YxhpZwHHA3mkhnuIyWGe2jXHCu", "1pFLr9fvck5HhyQgGpW0U8M2U8K5ryb9I",
  "12hCifr5b_xTJFGTvzACj6h3L0qylHeRC", "1nJ7fF9wgWIj0-OKidT2Rt0M1wDeV7oCa", "1VwwF-7KgpZtLR1U418vwPgK1uuTr0O5e", "1Oau182WNb3yk_0LmMpOcjPPUxbghULsc",
  "1e83vC2OSvo37mVu92NygWOs27qqm66kP", "18Ku_1PmIf4RmWcMz6Ni3_XixNV0wQ1h9", "1HQ4sslfMKMHKFyYWDnGYQZkGMKAkDnpX", "1_KwydwL_5jWcdWHQoMcteSheBf8LXcWY",
  "1-TsGKaZr5FJ2VyHHgxmjDXYDITUEmdel", "1J43Or0vcwM48bL1l_IXvEw_206qrVNr2", "1hXsC8ZYDHloWVt0Xwgdy321WSKvXhR_1", "14XhIlgyQsv2yPjcPsFjFpCau4N-55KWr"
];

export const SONGS: Song[] = rawLinks.map((driveId, index) => ({
  id: index + 1,
  // Since specific titles weren't provided, we use a stylized naming convention
  title: `Demo Track No. ${String(index + 1).padStart(2, '0')}`,
  driveId: driveId,
}));

// Using drive.google.com is standard. 
// We rely on removing crossOrigin in the player to fix the playback issues.
export const getAudioUrl = (id: string) => `https://drive.google.com/uc?export=download&id=${id}`;
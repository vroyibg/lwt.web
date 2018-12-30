import { TEXT_API } from "../Constants";
import { getAsync, postAsync } from "../Utilities/HttpRequest";

/**
 * Get the list of text
 */
export async function getTextsAsync(filters, page, itemPerPage) {
  try {
    return await getAsync(TEXT_API, {
      ...filters,
      page,
      itemPerPage
    });
  } catch (e) {
    return null;
  }
}

/**
 * create a text
 * @param text the text to create
 */
export async function createTextAsync(text) {
  try {
    await postAsync(TEXT_API, text);

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * create a text
 * @param textId the text id to get
 */
export async function getTextReadAsync(textId) {
  try {
    return await getAsync(`${TEXT_API}/${textId}`, null);
  } catch (e) {
    return false;
  }
}
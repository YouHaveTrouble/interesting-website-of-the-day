import mysql from "mysql";
import fs from "fs";

export default class Website {

  public static readonly currentWebsiteFilePath = "./current.json"

  url: string;
  name: string;
  description: string;

  constructor(url: string, name: string, description: string) {
    this.url = url;
    this.name = name;
    this.description = description;
  }

  /**
   * Save website data along with the time
   */
  public static async saveNewWebsite(website: Website): Promise<Website | null> {
    return new Promise(async (resolve) => {
      if (!website) return resolve(null);
      const data = {
        url: website.url,
        title: website.name,
        description: website.description,
        date: new Date().toUTCString(),
      }
      fs.writeFileSync(Website.currentWebsiteFilePath, JSON.stringify(data),  {
        encoding: 'utf8',
        flag: 'w',
      });
    });
  }

  /**
   * Get the daily website
   */
  public static async getCurrentWebsite(): Promise<Website | null> {
    const date = new Date();
    const day = date.getUTCDate();
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    if (!fs.existsSync(Website.currentWebsiteFilePath)) {
      const website = await this.getRandomWebsite();
      if (!website) return Promise.resolve(null);
      return Website.saveNewWebsite(website);
    }
    const data = fs.readFileSync(Website.currentWebsiteFilePath, {
      encoding: 'utf8',
      flag: 'r',
    });
    if (!data) {
      const website = await this.getRandomWebsite();
      if (!website) return Promise.resolve(null);
      return Website.saveNewWebsite(website);
    }
    const parsedData = JSON.parse(data);
    const lastDate = new Date(parsedData.date);
    if (lastDate.getUTCDate() === day && lastDate.getUTCMonth() === month && lastDate.getUTCFullYear() === year) {
      return Promise.resolve(new Website(parsedData.url, parsedData.title, parsedData.description));
    }
    const website = await this.getRandomWebsite();
    if (!website) return Promise.resolve(null);
    return Website.saveNewWebsite(website);
  }

  /**
   * Get a random website from the database
   */
  public static getRandomWebsite(): Promise<Website | null> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`${import.meta.env.DB_HOST}:${import.meta.env.DB_PORT}`);
        const connection = mysql.createConnection({
          host: import.meta.env.DB_HOST,
          port: import.meta.env.DB_PORT,
          user: import.meta.env.DB_USER,
          password: import.meta.env.DB_PASSWORD,
          database: import.meta.env.DB_DATABASE,
        });
        connection.connect();
        connection.query('SELECT url, title, description FROM websites ORDER BY RAND() LIMIT 1;', (err, result) => {
          if (err) {
            connection.end();
            return reject(err);
          }
          connection.end();
          resolve(new Website(result[0]?.url, result[0]?.title, result[0]?.description));
        });
      } catch (e) {
        resolve(null);
      }
    });
  }

}

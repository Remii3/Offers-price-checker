import { createTransport } from "nodemailer";

export async function sendNewPriceMail({
  url,
  currentPrice,
  lastPrice,
  name,
  userEmail,
}: {
  url: string;
  currentPrice: string;
  lastPrice: string;
  name: string;
  userEmail: string;
}) {
  const transport = createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    await transport.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Price change notification for ${name}`,
      html: `
      <p><strong>Cena zmieniła się!</strong></p>
      <p>Stara cena: ${lastPrice}</p>
      <p>Nowa cena: ${currentPrice}</p>
      <p>Ogłoszenie: <a href="${url}">${name || url}</a></p>
    `,
    });
  } catch (error) {
    console.error("Error sending mail: ", error);
  }
}

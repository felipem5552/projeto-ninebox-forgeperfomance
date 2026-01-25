import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter

async function configurarTransporter() {
  if (transporter) return

  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  console.log('📧 Serviço de E-mail (Gmail) inicializado!')
}

export async function enviarConviteAvaliacao(
  emailDestino: string,
  nomeFuncionario: string
) {
  await configurarTransporter()

  const linkSistema = process.env.FRONTEND_URL || 'http://localhost:5173'

  const htmlContent = `
    <h2>Olá, ${nomeFuncionario}!</h2>
    <p>Você recebeu uma nova avaliação no sistema.</p>
    <a href="${linkSistema}">Acessar sistema</a>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Sistema de Avaliação" <${process.env.EMAIL_USER}>`,
      to: emailDestino,
      subject: 'Nova avaliação registrada',
      html: htmlContent
    })

    console.log(`✅ Email enviado para ${emailDestino}`)

    return { sucesso: true, messageId: info.messageId }

  } catch (erro) {
    console.error('❌ Erro ao enviar email:', erro)
    return { sucesso: false, erro }
  }
}

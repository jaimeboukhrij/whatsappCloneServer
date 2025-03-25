export interface UserSeed {
  firstName:string;
  lastName:string;
  userName:string,
  password:string,
  email:string,
  urlImg?:string,
  cloudinaryId?:string,
  contactsId?:string[]

}

export const UsersSeed: UserSeed[] = [
  {
    firstName: 'Aida',
    lastName: 'Martín',
    userName: 'aida_martin',
    password: 'Abc123',
    email: 'aida.martin@example.com',
    cloudinaryId: 'WhatsApp/cwxg6qi2htemlxowaoqw'
  },
  {
    firstName: 'Alex',
    lastName: 'González',
    userName: 'alex_gonzalez',
    password: 'Abc123',
    email: 'alex.gonzalez@example.com',
    cloudinaryId: 'WhatsApp/mhphmqyl8jguwhke3kww'
  },
  {
    firstName: 'Adrian',
    lastName: 'Martínez',
    userName: 'adrian_martinez',
    password: 'Abc123',
    email: 'adrian.martinez@example.com',
    cloudinaryId: 'WhatsApp/hvuqpvcst7l10e3vgzuq',
    contactsId: ['4904fc79-da78-4e48-8204-e0de7a66f8a3']
  },
  {
    firstName: 'Antonio',
    lastName: 'Fernández',
    userName: 'antonio_fernandez',
    password: 'Abc123',
    email: 'antonio.fernandez@example.com',
    cloudinaryId: 'WhatsApp/wj4jwtboay1uomwocdjr'
  },
  {
    firstName: 'Beatriz',
    lastName: 'Torres',
    userName: 'beatriz_torres',
    password: 'Abc123',
    email: 'beatriz.torres@example.com',
    cloudinaryId: 'WhatsApp/nkprli0qazdeul5dqzhc'
  },
  {
    firstName: 'Bruno',
    lastName: 'Álvarez',
    userName: 'bruno_alvarez',
    password: 'Abc123',
    email: 'bruno.alvarez@example.com',
    cloudinaryId: 'WhatsApp/kerlgshbypkadeoux8gb'
  },
  {
    firstName: 'Carmen',
    lastName: 'Jiménez',
    userName: 'carmen_jimenez',
    password: 'Abc123',
    email: 'carmen.jimenez@example.com',
    cloudinaryId: 'WhatsApp/atr0prx5dq1vlgoiygr5'
  },
  {
    firstName: 'Cristina',
    lastName: 'De la Torre',
    userName: 'cristina_de_la_torre',
    password: 'Abc123',
    email: 'cristina.dlt@example.com',
    cloudinaryId: 'WhatsApp/m4rg5qoxploefiw54fk4'
  },
  {
    firstName: 'Dani',
    lastName: 'Pérez',
    userName: 'dani_perez',
    password: 'Abc123',
    email: 'dani.perez@example.com',
    cloudinaryId: 'WhatsApp/etu5ms04ulh46mstbpgb'
  },
  {
    firstName: 'Julian',
    lastName: 'Sánchez',
    userName: 'julian_sanchez',
    password: 'Abc123',
    email: 'julian.sanchez@example.com',
    cloudinaryId: 'WhatsApp/uqi3f8x1ca7x5snbl6ky'
  },
  {
    firstName: 'Lourdes',
    lastName: 'Rodríguez',
    userName: 'lourdes_rodriguez',
    password: 'Abc123',
    email: 'lourdes.rodriguez@example.com',
    cloudinaryId: 'WhatsApp/qkuumj6esihakbzgzb5b'
  },
  {
    firstName: 'Marcos',
    lastName: 'Gómez',
    userName: 'marcos_gomez',
    password: 'Abc123',
    email: 'marcos.gomez@example.com',
    cloudinaryId: 'WhatsApp/bqd1kjvjlvvyttviduhi'
  },
  {
    firstName: 'Natalia',
    lastName: 'Lopez',
    userName: 'natalia_lopez',
    password: 'Abc123',
    email: 'natalia.lopez@example.com',
    cloudinaryId: 'WhatsApp/pcyzhlpgkrv782lykati'
  },
  {
    firstName: 'Pusher',
    lastName: 'Castillo',
    userName: 'pusher_castillo',
    password: 'Abc123',
    email: 'pusher.castillo@example.com',
    cloudinaryId: 'WhatsApp/ftftaesqw6ooghfeayn8'
  }
]

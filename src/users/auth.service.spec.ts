import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { User } from "./user.entity";
import { UsersService } from "./users.service";
import { BadRequestException, NotFoundException } from '@nestjs/common';


describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async ()=> {
    const users: User[] = [];

    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) =>{
        const user =  {
          id: Math.floor(Math.random() *999), 
          email, 
          password 
        } as User
        users.push(user)
        return Promise.resolve(user);
     }
    }
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService
        }
      ]
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async() => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password',async () => {
    const user = await service.signup('asdf@asdf.com', 'asdf');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use',async () => {
    // fakeUsersService.find = () => Promise.resolve([{ id: 1, email: 'a', password: '1' } as User])
    await service.signup('asdf@asdf.com','asdf');
    try {
      await service.signup('asdf@asdf.com','asdf');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('throws if singin is called with an unused email',async () => {
    try {
      await service.signin('asdasd@asdasd.com', 'asdsad');
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundException);
    }
  });

  it('throws if and invalid password is provided', async() => {
    fakeUsersService.find = 
      () => Promise.resolve([{ email: 'asdsa@asd.com', id: 1, password: 'password' } as User]);
    try {
      await service.signin('asd@gmail.com', 'password');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
    }
  });

  it('returns a user if correft password is provided', async () => {
    await service.signup('asdf@asdf.com', 'mypassword');
    const user = await service.signin('asdf@asdf.com', 'mypassword');
    expect(user).toBeDefined();
  });
})

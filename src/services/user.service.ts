import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose'
import * as bcrypt from 'bcrypt';
import { validate, ValidationError } from 'class-validator'
import { User, UserDocument } from '../schemas/user.schema'
import { CreateUserDto } from "../dto/create-user.dto"
import { plainToClass } from 'class-transformer';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateProfileDto } from '../dto/update-profile.dto'

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService) { }

  /**
   * Creates a new user with hashed password.
   * @param createUserDto - The data for creating a new user.
   * @returns The created user.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    const createdUser = new this.userModel({ ...createUserDto, password: hashPassword })
    return createdUser.save();
  }

  /**
   * Finds a user by phone number.
   * @param phone_no - The phone number to search for.
   * @returns The found user or null if not found.
   */
  async findByphone(phone_no: string): Promise<User | null> {
    return this.userModel.findOne({ phone_no }).exec();
  }

  /**
   * Finds a user by email address.
   * @param email - The email address to search for.
   * @returns The found user or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /**
   * Generates a JWT token for a user.
   * @param userId - The ID of the user.
   * @returns The generated JWT token.
   */
  async login(userId: string): Promise<string> {
    return this.jwtService.sign({ userId: userId });
  }

  /**
   * Compares a plaintext password with a hashed password.
   * @param req_password - The plaintext password.
   * @param db_password - The hashed password stored in the database.
   * @returns True if the passwords match, false otherwise.
   */
  async deCryptPassword(req_password: string, db_password: string): Promise<Boolean> {
    return await bcrypt.compare(req_password, db_password);
  }

  /**
   * Updates the profile of a user.
   * @param updateProfiledto - The data for updating the user profile.
   * @returns The updated user profile.
   */
  async updateProfile(updateProfiledto: UpdateProfileDto): Promise<User> {
    const user = await this.userModel.findOne({ _id: updateProfiledto.user });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (updateProfiledto.firstname) {
      user.firstname = updateProfiledto.firstname;
    }

    if (updateProfiledto.lastname) {
      user.lastname = updateProfiledto.lastname;
    }

    if (updateProfiledto.password) {
      const hashPassword = await bcrypt.hash(updateProfiledto.password, 10)
      user.password = hashPassword
    }

    return await user.save()
  }

  /**
   * Validates the data for creating a new user.
   * @param dto - The data for creating a new user.
   * @returns An array of validation error messages, or an empty array if validation is successful.
   */
  async validateCreateUser(dto: CreateUserDto): Promise<string[]> {
    const userDto = plainToClass(CreateUserDto, dto);
    const errors: ValidationError[] = await validate(userDto);

    if (errors.length > 0) {
      return this.mapValidationErrors(errors);
    }

    return [];
  }

  /**
   * Validates the data for user login.
   * @param dto - The data for user login.
   * @returns An array of validation error messages, or an empty array if validation is successful.
   */
  async validateLoginUser(dto: LoginUserDto): Promise<string[]> {
    const userDto = plainToClass(LoginUserDto, dto);
    const errors: ValidationError[] = await validate(userDto);

    if (errors.length > 0) {
      return this.mapValidationErrors(errors);
    }

    return [];
  }

  /**
   * Validates the data for updating user profile.
   * @param dto - The data for updating user profile.
   * @returns An array of validation error messages, or an empty array if validation is successful.
   */
  async validateUpdateProfile(dto: UpdateProfileDto): Promise<string[]> {
    const userDto = plainToClass(UpdateProfileDto, dto);
    const errors: ValidationError[] = await validate(userDto);

    if (errors.length > 0) {
      return this.mapValidationErrors(errors);
    }

    return [];
  }

  /**
   * Maps validation errors to an array of error messages.
   * @param errors - An array of validation errors.
   * @returns An array of error messages.
   */
  private mapValidationErrors(errors: ValidationError[]): string[] {
    return errors
      .map((error) => this.flattenValidationErrors(error.constraints || {}))
      .flat();
  }

  /**
   * Flattens validation errors into an array of error messages.
   * @param constraints - The constraints from a validation error.
   * @returns An array of error messages.
   */
  private flattenValidationErrors(constraints: { [key: string]: string }): string[] {
    return Object.values(constraints);
  }
}

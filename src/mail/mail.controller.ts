import { Controller, Get } from '@nestjs/common';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { MailService } from './mail.service';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schema';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private mailerService: MailerService,
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1PM)
  testCron() {
    console.log("click me");
  }

  @Get()
  @Public()
  @ResponseMessage('Test email')
  // @Cron(CronExpression.EVERY_MINUTE)
  // @Cron('0 0 0 * * 0')
  async handleTestEmail() {
    const subscribers = await this.subscriberModel.find({});
    for (const subs of subscribers) {
      const subsSkills = subs.skills;
      const jobWithMatchingSkills = await this.jobModel.find({ skills: { $in: subsSkills } });
      if (jobWithMatchingSkills?.length) {
        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company.name,
            salary: `${item.salary}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' đ',
            skills: item.skills
          };
        });
        await this.mailerService.sendMail({
          to: 'thoidaihiephiepsi@gmail.com',
          from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to Nice App! Confirm your Email',
          template: 'new-job',
          context: {
            receiver: subs.name,
            jobs: jobs
          }
        });
      }
    }
  }
}
